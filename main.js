// Create VoxImplant instance
var voxAPI = VoxImplant.getInstance();
// Add event listeners
voxAPI.addEventListener(VoxImplant.Events.SDKReady, onSdkReady);
voxAPI.addEventListener(VoxImplant.Events.ConnectionEstablished, onConnectionEstablished);
voxAPI.addEventListener(VoxImplant.Events.ConnectionFailed, onConnectionFailed);
voxAPI.addEventListener(VoxImplant.Events.ConnectionClosed, onConnectionClosed);
voxAPI.addEventListener(VoxImplant.Events.AuthResult, onAuthResult);
voxAPI.addEventListener(VoxImplant.Events.IncomingCall, onIncomingCall);
voxAPI.addEventListener(VoxImplant.Events.MicAccessResult, onMicAccessResult);
 
// Initialize the SDK
try {
    voxAPI.init({ 
        useRTCOnly: true, // force usage of WebRTC
        micRequired: true, // ask mic/cam access before connection to VoxImplant
        videoSupport: true  // enable video support
    });
} catch(e) {
    // showing the message if browser doesn't support WebRTC
    if (e.message == "NO_WEBRTC_SUPPORT") alert("WebRTC support isn't available");
}
 
// Now we can use SDK functions - establish connection with VoxImplant
function onSdkReady(){        
    voxAPI.connect(); // mic/cam access dialog will be shown after the function call
}
 
// Process mic/cam dialog input result
function onMicAccessResult(e) {
    if (e.result) {
        // access was allowed
    } else {
        // access was denined - no connection will happen
    }
}
 
// Establishing connection with VoxImplant
function onConnectionEstablished() {
    // Authorization - show the dialog for user to let enter username/password and use login function
    // Change application_user, application_name, account_name and application_user_password to your data for testing
    var application_user = window.USER_CREDENTIALS.username;
    var application_name = 'tadhack';
    var account_name = 'vinesh';
    var application_user_password = window.USER_CREDENTIALS.password;
    voxAPI.login(application_user+"@"+application_name+"."+account_name+".voximplant.com", application_user_password);
}
 
// Couldn't establish connection with VoxImplant
function onConnectionFailed() {
    // Websockets or UDP connection is unavailable
}
 
// Connection with VoxImplant was closed
function onConnectionClosed() {
    // Can call connect here to reconnect
}
 
function onAuthResult(e) {
    if (e.result) { 
        // authorization was successful - can make/receive calls now
    } else {
        // authorization failed - check e.code to see the error code
    }
}
 
var currentCall = null; // current call
 
// handle incoming call
function onIncomingCall(e) {
    currentCall = e.call;
    // add event listeners
    currentCall.addEventListener(VoxImplant.CallEvents.Connected, onCallConnected);
    currentCall.addEventListener(VoxImplant.CallEvents.Disconnected, onCallDisconnected);
    currentCall.addEventListener(VoxImplant.CallEvents.Failed, onCallFailed);
    // Answer automatically. It's better to show the dialog to let answer/reject the call in real app.
    currentCall.answer();
}
 
// Make outbound call
function createCall() {
    // application_username - app username that will be dialed (with video)
    currentCall = voxAPI.call(application_username, true, null, {"X-DirectCall": "true"});
    // add event listeners
    currentCall.addEventListener(VoxImplant.CallEvents.Connected, onCallConnected);
    currentCall.addEventListener(VoxImplant.CallEvents.Disconnected, onCallDisconnected);
    currentCall.addEventListener(VoxImplant.CallEvents.Failed, onCallFailed);
}
 
// Call connected
function onCallConnected(e) {  
  // Start sending video and show incoming video    
  voxAPI.sendVideo(true);
  currentCall.showRemoteVideo(true);
}
 
// Call disconnected
function onCallDisconnected(e) {
  currentCall = null;
}
 
// Call failed
function onCallFailed(e) {
  // Error code -  e.code, error reason - e.reason
}