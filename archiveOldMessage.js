function archiveOldMessages() {
  // Prepare variables of SlackAPI
  const API_BASE_URL = 'https://slack.com/api/';
  const API_TOKEN = '?token=' + PropertiesService.getScriptProperties().getProperty('slack_oauth_access_token');

  // Current date
  const date = new Date();
  const timestamp = Math.floor( date.getTime() / 1000 );

  // Get channel list
  const API_CHANNELS_LIST = 'channels.list';
  const API_LIST = API_BASE_URL + API_CHANNELS_LIST + API_TOKEN;
  const responseList = UrlFetchApp.fetch(API_LIST);
  const dataChannelsList = JSON.parse(responseList.getContentText());
  const targetText = 'dev'

  for (var i=0; i<dataChannelsList.channels.length; i++) {
    if (dataChannelsList.channels[i].name.indexOf(targetText) === 0) { // Get data when contains targetText(dev)
      var channelName      = dataChannelsList.channels[i].name;
      var channelId        = dataChannelsList.channels[i].id;
      const channelTime      = 14; //　Set how many days of messages to keep
      const channelTimestamp = timestamp - (60 * 60 * 24 * channelTime);
      Logger.log(channelTime);

      // Get a list of time stamps of messages for the channels to be deleted
      const API_CHANNELS_HISTORY = 'channels.history';
      var API_HISTORY = API_BASE_URL + API_CHANNELS_HISTORY + API_TOKEN + '&channel=' + channelId + '&latest=' + channelTimestamp + '&count=' + 100; // delete maximum 100 datas
      var responseHistory = UrlFetchApp.fetch(API_HISTORY);
      var dataChannelsHistory = JSON.parse(responseHistory.getContentText());
      const arrTimeStamp = [];
      for (var j=0; j<dataChannelsHistory.messages.length; j++) {
        arrTimeStamp.push(dataChannelsHistory.messages[j]['ts']);
      }

      // Delete data
      const API_CHAT_DELETE = 'chat.delete';
      for (var k=0; k<arrTimeStamp.length; k++) {
        var API_DELETE = API_BASE_URL + API_CHAT_DELETE + API_TOKEN + '&channel=' + channelId + '&ts=' + arrTimeStamp[k];
        UrlFetchApp.fetch(API_DELETE);
        Utilities.sleep(1000); // wait one second for next
      }

      // Post complete message
      const API_POST_MESSAGE = 'chat.postMessage';
      var API_MESSAGE = API_BASE_URL + API_POST_MESSAGE + API_TOKEN + '&channel=' + channelName + '&text=' + 'Deleted archive data after ' + channelTime + ' days';
      var responseMessage = UrlFetchApp.fetch(API_MESSAGE);
    }
  }

}
