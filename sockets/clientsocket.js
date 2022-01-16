

var events = require('events');
var eventemitter = new events.EventEmitter();
var db = require('../database/mongodatabase');
var roommanager = require('../room_manager/roommanager');
var gamemanager = require('../game_manager/gamemanager');
var loginmanager = require('../room_manager/loginmanager');
var database=null;

exports.initdatabase = function(){
    db.connect(function(err) {
        if (err) {
            console.log('Unable to connect to Mongo.');
            process.exit(1);
        }
        console.log('Connected to the DB.');
        database = db.get();
        loginmanager.initdatabase(database);
        roommanager.initdatabase(database);
        gamemanager.initdatabase(database);
    });

    eventemitter.on('roomdelete',function (mydata) {
        roommanager.deleteroom(mydata);
    });
    //gameobjectlist.seteventemitter(eventemitter);
};

exports.initsocket = function(socket,io) 
{
    roommanager.setsocketio(io);
    gamemanager.setsocketio(io);
    gamemanager.addsocket(socket.id);
    // LOGIN
    socket.on('REQ_LOGIN', function(data)
    {
        console.log('----- LOGIN  ----- : ', data);
        loginmanager.LogIn(socket, data);
    });

    socket.on('REQ_LOGOUT', function(data)
    {
        loginmanager.LogOut(socket, data);
        console.log('----- LOGOUT ----- : ', data);
    });
    // Register
    socket.on('REQ_REGISTER', function(data)
    {
        loginmanager.SignUp(socket, data);
        console.log('----- REGISTER ----- : ', data);
    });

    
    socket.on('REQ_VALID_PHONE', function(data)
    {
        loginmanager.Valid_Phone(socket, data);
        console.log('received valid info : ', data);
    });
    socket.on('REQ_CHANGE_PASSWORD', function(data)
    {
        loginmanager.ChangePassword(socket, data);
        console.log('new Password : ', data);
    });
    // Check Room
    socket.on('REQ_CHECK_ROOMS', function(data)
    {   
        //console.log('----- Request CHECK Room -----', data);
        roommanager.Check_Rooms(socket, data);
    });
    // Create Room
    socket.on('REQ_CREATE_ROOM', function(data)
    {
        //console.log('----- Request Create Room -----', data);
        roommanager.CreateRoom(socket, data);
    });
    // Join Room
    socket.on('REQ_JOIN_ROOM', function(data)
    {
        console.log('----- Request Join Room -----', data);
        roommanager.JoinRoom(socket, data);
    });
    socket.on('Game_Fore_End', function(data)
    {
        gamemanager.RemoveRoom(socket, data);
    });
    socket.on('PASS_TIME_RESULT', function(data)
    {
        gamemanager.GetRoomPassedTime(socket, data);
    });
    // Get user list in the room
    socket.on('REQ_USERLIST_ROOM', function(data)
    {
        gamemanager.GetUserListInRoom(data.roomid);
    });
    // Get turn user
    socket.on('REQ_TURNUSER', function(data)
    {
        gamemanager.GetTurnUser(socket, data);
    });
    socket.on('REQ_GUESS_SUCCESS', function(data)
    {
        gamemanager.GuessWordSuccess(data);
    });
    // Test
    socket.on('REQ_ROOM_LIST', function()
    {
        roommanager.GetRoomList();
    });
    // Chat
    socket.on('REQ_CHAT', function(data)
    {
        gamemanager.ChatMessage(socket, data);
    });
    // Leave Room
    socket.on('REQ_LEAVE_ROOM', function(data){
        gamemanager.LeaveRoom(socket, data);
    });
    
    // disconnect
    socket.on('disconnect', function(){
        console.log("----- DISCONNECTED -----");
        gamemanager.OnDisconnect(socket);
    });
    socket.on('reconnect', (attemptNumber) => {
        console.log(attemptNumber);
      });
    socket.on('RECONNECTED', function(data){
        
        console.log("----- REQUEST RECONNECT ------- ", data);
        roommanager.ReJoinRoom(socket, data);
    });
    socket.on('REQ_ROLL_DICE', function(data)
    {
        //console.log(data);
        gamemanager.Roll_Dice(socket, data);
    });
    socket.on('REQ_MOVE_TOKEN', function(data)
    {
        //console.log(data);
        gamemanager.Move_Token(socket, data);
    });

    socket.on('REQ_AUTO', function(data)
    {
        //console.log(data);
        gamemanager.Set_Auto(socket, data);
    });
    // Get user information
    socket.on('REQ_USER_INFO', function(data)
    {
        loginmanager.GetUserInfo(socket, data);
    });
    // update user' profile
    socket.on('REQ_UPDATE_USERINFO', function(data)
    {
        loginmanager.UpdateUserInfo(socket, data);
    });
    // upload user's photo
    socket.on('UPLOAD_USER_PHOTO', function(data){
        loginmanager.Get_User_Photo(data, socket);
    });
    
    socket.on('UPLOAD_LIC_PHOTO', function(data){
        loginmanager.Get_Lic_Photo(data, socket);
    });

    socket.on('REQ_KYC_INFO', function(data){
        console.log('kyc data ===  ', data);
        loginmanager.Insert_KYC(data, socket);
    });

    socket.on('REQ_CHECK_KYC', function(data){   
        console.log('check_kyc : ' , data);     
        loginmanager.Check_KYC(data, socket);
    });

    socket.on('REQ_WITHDRAW', function(data){   
        console.log('req_withdraw : ' , data);     
        loginmanager.Insert_Withdraw(data, socket);
    });

    socket.on('REQ_GET_COINS', function(data){
        loginmanager.Get_Coins(data, socket);
    });
    // get room information
    socket.on('REQ_ROOM_INFO', function(data)
    {
        roommanager.GetRoomInfo(socket, data);
    });
    
    socket.on('REQ_GAME_HIST', function(data)
    {        
        gamemanager.AddHistory(data);
    });
    socket.on('REQ_CHECK_REFFERAL', function(data)
    {
        console.log('referral code : ', data);
        roommanager.CheckRefferal(socket, data);
    });
    socket.on('REQ_PAUSE', function(data)
    {
        console.log("----REQ PAUSE -----", data);
        gamemanager.Pause_Game(socket, data);
    });
    socket.on('REQ_RESUME', function(data)
    {
        gamemanager.Resume_Game(socket, data);
    });

    socket.on('REQ_SHOPITEM_INFO', function()
    {   
        loginmanager.GetShopItems(socket);
    });

    socket.on('REQ_SPECIAL_INFO', function()
    {        
        loginmanager.GetSpecialInfo(socket);
    });
    
    socket.on('REQ_GAME_SETTINGS', function()
    {     
        loginmanager.GetGameSettings(socket);
    });

    socket.on('REQ_WALLET_HISTORIES', function(data)
    {     
        loginmanager.GetWalletHistories(socket, data);
    });
    
    socket.on('REQ_GAME_BIDS', function()
    {    
        loginmanager.GetGameBids(socket);
    });
    
}