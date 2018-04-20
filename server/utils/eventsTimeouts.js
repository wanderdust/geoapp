const {Group} = require('./../models/groups.js');
const {UserGroup} = require('./../models/user-groups.js');
const {Request} = require('./../models/requests.js');
const {Messages} = require('./../models/message.js');
const {mongoose} = require('./../db/mongoose.js');
const {ObjectID} = require('mongodb');
const moment = require('moment');
const schedule = require('node-schedule');
const {sendPushMessages} = require('./sendPushNotification.js');

let deleteGroup = async function (groupId) {
  try {
    console.log('groupId', groupId)
    // We find the group and delete it.
    let group = await Group.deleteOne({_id: ObjectID(groupId)});

    // We find the users belonging to that group and remove them.
    let usersInGroup = await UserGroup.deleteMany({groupId: groupId});

     // we find if there are any pending requests for a group and delete them.
     let requests = await Request.deleteMany({groupId: groupId});

     // we find the chat for that group and delete it.
     let chat = await Messages.deleteOne({groupId: groupId});
  } catch (e) {
    console.log(e)
  }
};


let removeGroupTimeout = function (date, groupId) {
  let m = moment(date);
  // we schedule the remove for 24 hours after the event.
  let scheduledRemove = m.add(24, 'hours').format();
  // schedules the job to delete once the timeout reaches
  schedule.scheduleJob(scheduledRemove, function() {
    deleteGroup(groupId);
  });
};

let sendEventReminder = function (date, recipients, msg, frqnc) {
  let m = moment(date);
  // Reminder for push notification 8 hours berore event.
  let minusEightHours = m.subtract(8, 'hours');
  let schedulePushNotification = minusEightHours.format();

  if (frqnc === 'once') {
    // Send a reminder just once
    schedule.scheduleJob(schedulePushNotification, function() {
      sendPushMessages(recipients, msg)
    });
  } else if (frqnc === 'weekly') {
    // send a reminder once a week.
    schedule.scheduleJob({
      hour: minusEightHours.hour(),
      minute: minusEightHours.minute(),
      dayOfWeek: minusEightHours.day()
    }, function() {
      sendPushMessages(recipients, msg)
    });
  }
};


module.exports = {removeGroupTimeout, sendEventReminder}
