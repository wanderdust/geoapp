let Templates = {};

// Template for a user container
Templates.userTemplateA = [
  '<div class="group-container user-container">',
    '<div class="image-animation"></div>',
    '<div class="image">',
      '<img src={{userImage}} class="img-responive img-fluid">',
    '</div>',
    '<div class="group-header">',
      '<p class="group-title">{{name}}</p>',
      '<p class="group-status"></p>',
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
      '<img src={{userImage}} class="img-responive img-fluid">',
    '</div>',
    '<div class="group-header">',
      '<p class="group-title">{{name}}</p>',
      '{{#if isPending}}',
        '<p class="group-status">{{name}} va a ir.</p>',
        '{{else}}',
        '<p class="group-status"></p>',
      '{{/if}}',
    '</div>',
  '</div>'
].join('\n')

// Template for a group container
Templates.groupTemplateA = [
  '<div class="group-container main">',
    '<div class="image-animation"></div>',
    '<div class="image"><img src="{{groupImage}}" class="img-responive img-fluid"></div>',
    '<div class="group-header">',
      '<p class="group-title user-name">{{title}}</p>',
      '{{#if activeUsers.[0]}}',
      '<p class="group-status">{{#each activeUsers}} {{this}}.  {{/each}}</p>',
      '{{else}}',
        '{{#if pendingUsers}}',
          '<p class="group-status">Van: {{#each pendingUsers}} {{this}}. {{/each}}</p>',
        '{{/if}}',
      '{{/if}}',
    '</div>',
  '</div>'
].join('\n');

// Template for a group container (pending)
Templates.groupTemplatePending = [
  '<div class="group-container pending">',
    '<div class="image-animation"></div>',
    '<div class="image"><img src="{{groupImage}}" class="img-responive img-fluid"></div>',
    '<div class="group-header pending">',
      '<p class="group-title user-name">{{title}}</p>',
      '{{#if activeUsers.[0]}}',
      '<p class="group-status">{{#each activeUsers}} {{this}}.  {{/each}}</p>',
      '{{else}}',
        '{{#if pendingUsers}}',
          '<p class="group-status">Van: {{#each pendingUsers}} {{this}}. {{/each}}</p>',
        '{{/if}}',
      '{{/if}}',
    '</div>',
    '<div class="ok-tick"><image class="img-responive img-fluid " src="./css/fonts/ok-tick.svg">',
    '</div>',
  '</div>',
].join('\n');

// Template for the header in the users view.
Templates.usersGroupHeader = [
  '<div id="group-title-group">',
    '<p>{{groupName}}</p>',
  '</div>',
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
    '<div class="added-friend-image">',
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
      '<p class="group-status user-status"></p>',
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
].join('\n')
