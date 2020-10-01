const HabitModel = require("../models/Habit.model");

const { ObjectID } = require("mongodb");

module.exports.addHabit = async (request, response) => {
  const requestBody = request.body;
  const userData = request.userData;
  try {
    if (typeof requestBody != "object") {
      return response.status(400).json({
        status: false,
        message: "must be an object",
      });
    }
    if (
      !requestBody.name &&
      requestBody.name == "" &&
      typeof requestBody.name != "string"
    ) {
      return response.status(400).json({
        status: false,
        message: "name required and must be a string",
      });
    }

    if (
      !requestBody.type &&
      requestBody.type == "" &&
      typeof requestBody.type != "string" &&
      !["DAILY", "WEEKLY"].includes(requestBody.type)
    ) {
      return response.status(400).json({
        status: false,
        message:
          "type required and must be a string and should be type 'DAILY'  or 'WEEKLY' ",
      });
    }

    if (
      !requestBody.hasOwnProperty("status") &&
      typeof requestBody.status != "boolean"
    ) {
      return response.status(400).json({
        status: false,
        message: "status required and must be a boolean",
      });
    }

    const newHabit = new HabitModel({
      name: requestBody.name,
      description: requestBody.status || "",
      type: requestBody.type,
      status: requestBody.status,
      user: userData._id,
    });
    const result = await newHabit.save();

    return response.status(200).json({
      status: true,
      message: "New Habit Added Successfully",
      data: result,
    });
  } catch (error) {
    // console.log(error);

    return response.status(400).json({
      status: false,
      message: error,
    });
  }
};

module.exports.addRoutineStatus = async (request, response) => {
  const requestBody = request.body;
  try {
    if (typeof requestBody != "object") {
      return response.status(400).json({
        status: false,
        message: "must be an object",
      });
    }
    if (
      !requestBody.habitId &&
      requestBody.habitId == "" &&
      typeof requestBody.habitId != "string" &&
      !ObjectID.isValid(requestBody.habitId)
    ) {
      return response.status(400).json({
        status: false,
        message: "name required and must be a string",
      });
    }

    if (
      !requestBody.hasOwnProperty("routineDone") &&
      typeof requestBody.routineDone != "boolean"
    ) {
      return response.status(400).json({
        status: false,
        message: "routineDone required and must be a boolean",
      });
    }

    const result = await HabitModel.findOneAndUpdate(
      {
        _id: requestBody.habitId,
        "history.createdAt": { $not: { $lte: new Date() } },
      },
      {
        $push: { history: { routineDone: requestBody.routineDone } },
      },
      {
        new: true,
      }
    ).exec();

    if (!result) {
      response.status(400).json({
        status: false,
        message: "Status Already Update",
      });
    }

    return response.status(200).json({
      status: true,
      message: "Habit Routine Status Updated Successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);

    return response.status(400).json({
      status: false,
      message: error,
    });
  }
};

module.exports.updateHabit = async (request, response) => {
  const requestBody = request.body;
  const userObjectID = request.userData._id;
  try {
    if (typeof requestBody != "object") {
      return response.status(400).json({
        status: false,
        message: "must be an object",
      });
    }

    if (
      !requestBody.habitId &&
      requestBody.habitId == "" &&
      typeof requestBody.habitId != "string" &&
      !ObjectID.isValid(requestBody.habitId)
    ) {
      return response.status(400).json({
        status: false,
        message: "name required and must be a string",
      });
    }

    if (typeof requestBody.update != "object") {
      return response.status(400).json({
        status: false,
        message: "must be an object",
      });
    }

    const updateObject = {};

    if (requestBody.update.name) {
      updateObject.name = requestBody.update.name;
    }
    if (requestBody.update.description) {
      updateObject.description = requestBody.update.description;
    }
    if (requestBody.update.hasOwnProperty("status")) {
      updateObject.status = requestBody.update.status;
    }

    if (["DAILY", "WEEKLY"].includes(requestBody.update.type)) {
      updateObject.type = requestBody.update.type;
    }

    const result = await HabitModel.findOneAndUpdate(
      {
        _id: requestBody.habitId,
        user: userObjectID,
      },
      updateObject,
      { new: true }
    ).exec();
    if (!result) {
      response.status(400).json({
        status: false,
        message: "Failed To Update",
      });
    }
    return response.status(200).json({
      status: true,
      message: "Habit Details Updated Successfully",
      data: result,
    });
  } catch (error) {
    response.status(400).json({
      status: false,
      message: error.toString(),
    });
  }
};

module.exports.getHabit = async (request, response) => {
  const id = await request.params.objectId;
  const userObjectID = request.userData._id;
  try {
    if (id) {
      if (typeof id != "string") {
        return response.status(400).json({
          status: false,
          message: "id must be string",
        });
      }

      if (!ObjectID.isValid(id)) {
        return response.status(400).json({
          status: false,
          message: `invalid object id`,
        });
      }

      const result = await HabitModel.aggregate([
        { $match: { _id: ObjectID(id), user: userObjectID } },
        {
          $project: {
            _id: "$_id",
            name: "$name",
            description: "$description",
            status: "$status",
            createdAt: "$createdAt",
          },
        },
      ]);

      return response.status(200).json({
        status: false,
        message: "Habit list",
        data: result,
      });
    }

    const result = await HabitModel.aggregate([
      { $match: { user: userObjectID } },
      {
        $project: {
          _id: "$_id",
          name: "$name",
          description: "$description",
          status: "$status",
          createdAt: "$createdAt",
        },
      },
    ]);
    // const result = await HabitModel.find({ user: userObjectID }).exec();
    return response.status(200).json({
      status: false,
      message: "Habit list",
      data: result,
    });
  } catch (error) {
    response.status(400).json({
      status: false,
      message: error.toString(),
    });
  }
};

module.exports.getHabitTimeline = async (request, response) => {
  const id = await request.params.objectId;
  const userObjectID = request.userData._id;
  try {
    if (id) {
      if (typeof id != "string") {
        return response.status(400).json({
          status: false,
          message: "id must be string",
        });
      }

      if (!ObjectID.isValid(id)) {
        return response.status(400).json({
          status: false,
          message: `invalid object id`,
        });
      }

      const result = await HabitModel.aggregate([
        { $match: { _id: ObjectID(id), user: userObjectID } },
        {
          $project: {
            _id: "$_id",
            name: "$name",
            history: "$history",
          },
        },
      ]);

      return response.status(200).json({
        status: false,
        message: "Habit Timeline",
        data: result,
      });
    }

    const result = await HabitModel.aggregate([
      { $match: { user: userObjectID } },
      {
        $project: {
          _id: "$_id",
          name: "$name",
          history: "$history",
        },
      },
    ]);
    return response.status(200).json({
      status: false,
      message: "Habit Timeline",
      data: result,
    });
  } catch (error) {
    response.status(400).json({
      status: false,
      message: error.toString(),
    });
  }
};

module.exports.deleteHabit = async (request, response) => {
  let id = await request.params.objectId;
  const userObjectID = request.userData._id;
  try {
    if (id) {
      if (typeof id != "string") {
        return response.status(400).json({
          status: false,
          message: "id must be string",
        });
      }

      if (!ObjectID.isValid(id)) {
        return response.status(400).json({
          status: false,
          message: `invalid object id`,
        });
      }

      const result = await HabitModel.deleteOne({
        _id: id,
        user: userObjectID,
      }).exec();

      if (result.deletedCount) {
        return response.status(200).json({
          status: true,
          message: "Habit Deleted Successfully",
        });
      }

      return response.status(400).json({
        status: false,
        message: "Failed To Delete",
      });
    }
  } catch (error) {
    response.status(400).json({
      status: false,
      message: error.toString(),
    });
  }
};
