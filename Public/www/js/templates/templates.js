let Templates = {};

// Template for a user container
Templates.userTemplateA = [
  '<div class="group-container user-container waves-effect waves-light">',
    '<div class="image-animation"></div>',
    '<div class="image">',
      '<img src={{userImage}} class="hidden">',
    '</div>',
    '<div class="group-header">',
      '<p class="group-title">{{name}}</p>',
      '<p class="group-status">{{userStatus}}</p>',
    '</div>',
    '<div class="ok-tick">',
      '<image class="img-responive img-fluid " src="./css/assets/add-icon.png">',
    '</div>',
  '</div>'
].join('\n');

// Template for a user container
Templates.userTemplateB = [
  '<div class="group-container user-container">',
    '<div class="image-animation {{#if isOnline}} online-group {{/if}}"></div>',
    '<div class="image">',
      '<img src="{{userImage}}" class="hidden">',
    '</div>',
    '<div class="group-header">',
      '<p class="group-title">{{name}}</p>',
      '{{#if isPending}}',
        '<p id="isNotGoing" class="group-status">{{userStatus}}</p>',
        '<p id="isGoing" class="group-status hidden">Va a ir. - <span id="timeStamp">{{time}}.<span></p>',
        '{{else}}',
        '<p class="group-status">{{userStatus}}</p>',
      '{{/if}}',
    '</div>',
    '{{#if isPending}}',
      '<div class="pending-icon waves-effect waves-light">',
        '<img src="css/assets/sidebar-icons/icon_pending_orange.svg">',
      '</div>',
    '{{/if}}',
  '</div>'
].join('\n');

// Template for a user container
Templates.userTemplateC = [
  '<div class="group-container user-container">',
    '<div class="image-animation {{#if isOnline}} online-group {{/if}}"></div>',
    '<div class="image">',
      '<img src="{{userImage}}" class="hidden">',
    '</div>',
    '<div class="group-header">',
      '<p class="group-title">{{name}}</p>',
      '<p class="group-status">{{userStatus}}</p>',
    '</div>',
      // '<a class="pending-icon waves-effect waves-light">',
      //   '<img src="css/assets/sidebar-icons/icon_vertical_options_orange.svg">',
      // '</a>',
  '</div>'
].join('\n')

// Template for a group container
Templates.groupTemplateA = [
  '<div class="group-container main waves-effect waves-orange">',
    '<div class="image-animation"></div>',
    '<div class="image"><img src="{{groupImage}}" class="hidden"></div>',
    '<div class="group-header">',
      '<p class="group-title user-name">{{title}}</p>',
      '{{#if activeUsers.[0]}}',
      '<p class="group-status">Están: {{#each activeUsers}} {{this}}.  {{/each}}</p>',
      '{{else}}',
        '{{#if pendingUsers}}',
          '<p class="group-status">Van: {{#each pendingUsers}} {{this}}. {{/each}}</p>',
        '{{else}}',
            '<p class="group-status group-offline">Grupo offline.</p>',
        '{{/if}}',
      '{{/if}}',
    '</div>',
  '</div>'
].join('\n');

// Template for a group container (pending)
Templates.groupTemplatePending = [
  '<div class="group-container pending">',
    '<div class="image-animation"></div>',
    '<div class="image"><img src="{{groupImage}}" class="hidden"></div>',
    '<div class="group-header pending">',
      '<p class="group-title user-name">{{title}}</p>',
      '{{#if activeUsers.[0]}}',
      '<p class="group-status">Están: {{#each activeUsers}} {{this}}.  {{/each}}</p>',
      '{{else}}',
        '{{#if pendingUsers}}',
          '<p class="group-status">Van: {{#each pendingUsers}} {{this}}. {{/each}}</p>',
        '{{/if}}',
      '{{/if}}',
    '</div>',
    '<div class="ok-tick"><image class="img-responive img-fluid " src="./css/assets/sidebar-icons/ok-tick.svg">',
    '</div>',
  '</div>',
].join('\n');

// Template for the header in the users view.
Templates.usersGroupHeader = [
  '<div id="group-sub-title">',
    '{{#if isOnline}}',
      '<p>Estado: online</p>',
    '{{else}}',
      '{{#if isPending}}',
          '<p>Estado: pendiente</p>',
      '{{else}}',
          '<p>Estado: offline</p>',
      '{{/if}}',
    '{{/if}}',
  '</div>'
].join('\n');

// Template for the count of users online and offline.
Templates.userCount = [
  '{{#if isOnline}}',
    '<span class="list-of-users">Usuarios online ({{onlineUsers}})</span>',
  '{{else}}',
    '<span class="list-of-users">Usuarios offline ({{offlineUsers}})</span>',
  '{{/if}}'
].join('\n')

// Template for the placeholder for when there is no content.
Templates.contentPlaceholder = [
  '<div class="empty-list-placeholder">',
    '<h2>{{placeholder}}</h2>',
  '</div>'
].join('\n');

// Template for the little user icon on 'Create-groups' view.
Templates.addedUser = [
  '<div class="added-friend">',
    '<div class="eliminate-button">',
      '<img class="centered-image" src="css/assets/icon_close_16dp.svg">',
    '</div>',
    '<div class="added-friend-image image">',
      '<img class="centered-image" src={{userImage}}>',
    '</div>',
    '<div class="added-friend-name">',
      '<p>{{name}}</p>',
    '</div>',
  '</div>'
].join('\n');

// Template for the count of users in each list.
Templates.listCount = [
  '<p>{{title}} ({{count}})</p>'
].join('\n');

// Template for a request container.
Templates.requestTemplate = [
  '<div class="group-container invitation-container">',
    '<div class="image">',
      '<img src="{{groupImage}}" class="img-responive img-fluid">',
    '</div>',
    '<div class="group-header request-header">',
      '<p class="group-title">{{title}}</p>',
      '<p class="group-status user-status">{{userStatus}}</p>',
    '</div>',
    '<div class="accept-reject-container">',
      '<div class="accept-btn invitation-btn">',
        '<p>Aceptar</p>',
      '</div>',
      '<div class="reject-btn invitation-btn">',
        '<p>Rechazar</p>',
      '</div>',
    '</div>',
  '</div>'
].join('\n');

// Template for group-request container.
Templates.requestTemplateGroup = [
  '<div class="group-container invitation-container">',
    '<div class="image">',
      '<img src="{{groupImage}}" class="img-responive img-fluid">',
    '</div>',
    '<div class="group-header request-header">',
      '<p class="group-title">{{title}}</p>',
      '<p class="group-status user-status">Te ha invitado {{sentBy}}</p>',
    '</div>',
    '<div class="accept-reject-container">',
      '<div class="accept-btn invitation-btn">',
        '<p>Aceptar</p>',
      '</div>',
      '<div class="reject-btn invitation-btn">',
        '<p>Rechazar</p>',
      '</div>',
    '</div>',
  '</div>'
].join('\n');

// Template for infowindow in maps.
Templates.infoWindowMaps = [
  '<p class="info-window">{{title}}</p>'
].join('\n');

// Template for notification in side-menu
Templates.badge = [
    '<span class="list-notification new badge" data-badge-caption="nuevos">{{requestLength}}</span>'
].join('\n');

// Template for blue pre preloaderBlue
Templates.preloaderBlue = [
  '<div class="preloader-wrapper small active">',
    '<div class="spinner-layer spinner-blue-only">',
      '<div class="circle-clipper left">',
        '<div class="circle"></div>',
      '</div><div class="gap-patch">',
        '<div class="circle"></div>',
      '</div><div class="circle-clipper right">',
        '<div class="circle"></div>',
      '</div>',
    '</div>',
  '</div>'
].join('\n');

// Template for location image.
Templates.myLocation = [
  '<img src="./css/assets/my_location.svg">'
].join('\n');

Templates.messagesNav = [
  '<div id="user-group-image" class="col s3">',
    '<div id="image-container">',
      '<img src="{{groupImage}}">',
    '</div>',
  '</div>',
  '<div id="chat-title-subtitle" class="col s9">',
    '<div id="chat-title" class="nav-text valign-wrapper">',
      '<p class="truncate">{{title}}</p>',
    '</div>',
    '<div id="chat-sub-title" class="nav-text valign-wrapper">',
      '<p class="truncate">{{status}}</p>',
    '</div>',
  '</div>'
].join('\n');

Templates.message = [
    '<div class="message-container">',
      '<div class="message-title">',
      '  <h4>{{title}}</h4>',
        '<span class="valign-wrapper">{{timeStamp}}</span>',
      '</div>',
      '<div class="message-body">',
        '<p class="flow-text">{{body}}</p>',
      '</div>',
    '</div>'
].join('\n');
