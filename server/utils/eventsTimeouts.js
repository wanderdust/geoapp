const {Group} = require('./../models/groups.js');
const {User} = require('./../models/users.js');
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

// We execute this function when the server goes on.
// This starts the timeouts in case the server shuts down.
// This way we dont lose the timeouts.
let startEventReminders = async function () {
  // First we find all groups with frequence once or weekly
  let groups = await Group.find({frequence: {$in: ['once', 'weekly']}});

  // We loop through the frequence 'once' groups;
  for (let group of groups) {
    // We check if any events have already passed + 24 hours for 'once' events.
    if (group.frequence === 'once') {
      let date = moment(group.date).add(24, 'hours').format('X');
      let currentTime = moment(new Date()).format('X');

      if (currentTime > date) {
        // If it has passed more than 24 hours since the event we erase it.
        deleteGroup(group._id);
      }
    }

    // We set the timeouts for reminder.
    // For each group we find all the members
    let recipients = [];
    let usersInGroup = await UserGroup.find({groupId: group._id});
    let msg = {
      title: 'Recordatorio de evento',
      body: `${group.title} hoy a las ${moment(group.date).format("HH:mm A")}`
    }

    // Loop through all users to add their FCM to the array.
    for (let userInGroup of usersInGroup) {
      let user = await User.findById(userInGroup.userId);
      recipients.push(user.fcmRegId);
    };
    sendEventReminder(group.date, recipients, msg, group.frequence)
  }
}


module.exports = {removeGroupTimeout, sendEventReminder, startEventReminders}
