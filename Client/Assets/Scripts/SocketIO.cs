using System;
using System.Collections.Generic;
using UnityEngine;

using BestHTTP.SocketIO;
using LitJson;

public class SocketIO : MonoBehaviour
{
    //[SerializeField]
    //private string m_Address = "127.0.0.1";
    [SerializeField]
    private int m_Port = 10020;

    private SocketManager m_socket = null;

    private void Awake()
    {
        Global.SocketIO = this;
    }

    void Start()
    {
        //ConnectToServer();
    }

    private void OnDestroy()
    {
        if (m_socket != null) {
            m_socket.Close();
            m_socket = null;
        }
    }

    private void Log(string evtName, JsonData json)
    {
        Debug.Log("[" + evtName + "] " + JsonMapper.ToJson(json));
    }

    private void OnRegisterPlayerResult(Socket socket, Packet packet, params object[] args)
    {
        JsonData json = JsonMapper.ToObject(JsonMapper.ToJson(args[0]));
        Log("OnRegisterPlayerResult", json);

        Global.PlayerId = Convert.ToInt32(json["id"].ToString());
        Global.Rank = Convert.ToInt32(json["rank"].ToString());

        Global.GameUIManager.Lobby();
    }

    private void OnLeaveRoomResult(Socket socket, Packet packet, params object[] args)
    {
        JsonData json = JsonMapper.ToObject(JsonMapper.ToJson(args[0]));
        Log("OnLeaveRoomResult", json);

        bool result = Convert.ToBoolean(json["result"].ToString());

        if (result)
            Global.GameUIManager.Lobby();
    }

    private void OnJoinRoomResult(Socket socket, Packet packet, params object[] args)
    {
        JsonData json = JsonMapper.ToObject(JsonMapper.ToJson(args[0]));
        Log("OnJoinRoomResult", json);

        JOIN_ERROR_CODE status = (JOIN_ERROR_CODE)Convert.ToInt32(json["status"].ToString());
        if (status == JOIN_ERROR_CODE.JOIN_SUCCESS) // join room result
        {
            Global.PlayerId = Convert.ToInt32(json["id"].ToString());
            Global.RoomName = json["roomname"].ToString();
            Global.CountDown = Convert.ToInt32(json["countdown"].ToString());
            Global.RoomStatus = (ROOM_STATUS)Convert.ToInt32(json["state"].ToString()); ;
            Global.Players = json["players"];

            Global.FindMyIndex();
            Global.GameUIManager.Game();
            Global.GameManager.NewRound();
            Global.GameManager.RefreshUI();
        }
    }

    private void OnRoomListResult(Socket socket, Packet packet, params object[] args)
    {
        JsonData json = JsonMapper.ToObject(JsonMapper.ToJson(args[0]));

        if (Global.GameUIManager.m_LobbyUI.activeSelf)
            Global.GameUIManager.m_LobbyUI.GetComponent<LobbyUIManager>().RefreshRooms(json["rooms"]);
    }

    private void OnGameWinner(Socket socket, Packet packet, params object[] args)
    {
        JsonData json = JsonMapper.ToObject(JsonMapper.ToJson(args[0]));
        Log("OnGameWinner", json);

        Global.RoomStatus = ROOM_STATUS.ENDED;
        Global.GameManager.RefreshUI();
        Global.GameManager.WinningResult(json["result"].ToString());
    }

    private void OnGamePlayers(Socket socket, Packet packet, params object[] args)
    {
        JsonData json = JsonMapper.ToObject(JsonMapper.ToJson(args[0]));
        Log("OnGamePlayers", json);

        Global.Players = json["players"];
        Global.FindMyIndex();
        Global.GameManager.RefreshUI();
    }

    private void OnGameNewState(Socket socket, Packet packet, params object[] args)
    {
        JsonData json = JsonMapper.ToObject(JsonMapper.ToJson(args[0]));
        Log("OnGameNewState", json);

        Global.RoomStatus = (ROOM_STATUS)Convert.ToInt32(json["state"].ToString());
        if (Global.RoomStatus == ROOM_STATUS.STARTED)
            Global.GameManager.NewRound();
        Global.GameManager.RefreshUI();
    }

    private void OnGameCountDown(Socket socket, Packet packet, params object[] args)
    {
        JsonData json = JsonMapper.ToObject(JsonMapper.ToJson(args[0]));
        Log("OnGameCountDown", json);

        Global.CountDown = Convert.ToInt32(json["countdown"].ToString());
        Global.GameManager.RefreshUI();
    }

    private void OnGameEndTurn(Socket socket, Packet packet, params object[] args)
    {
        JsonData json = JsonMapper.ToObject(JsonMapper.ToJson(args[0]));
        Log("OnGameEndTurn", json);

        Global.RoomStatus = ROOM_STATUS.STOPPED;
        Global.GameManager.RefreshUI();
        Global.GameManager.EndTurn(json["p1Action"].ToString(), json["p2Action"].ToString());
    }

    private void OnPlayerRankResult(Socket socket, Packet packet, params object[] args)
    {
        JsonData json = JsonMapper.ToObject(JsonMapper.ToJson(args[0]));
        Log("OnPlayerRankResult", json);

        Global.Rank = Convert.ToInt32(json["rank"].ToString());
    }

    public void Emit(string msgType, Dictionary<string, string> data)
    {
        m_socket.EmitAll(msgType, JsonMapper.ToJson(data));
    }

    public void ConnectToServer(string ip)
    {
        if (m_socket != null)
            return;
        string address = "http://" + ip + ":" + m_Port + "/socket.io/";
        SocketOptions options = new SocketOptions();
        options.ServerVersion = SupportedSocketIOVersions.v3;

        m_socket = new SocketManager(new Uri(address), options);

        m_socket.Socket.On(SocketIOEventTypes.Connect, (s, p, a) =>
        {
            RegisterPlayer();
            Debug.Log("connected to server");
        });

        m_socket.Socket.On(SocketIOEventTypes.Disconnect, (s, p, a) =>
        {
            Debug.LogWarning("disconnected from server");
        });

        m_socket.Socket.On(SocketIOEventTypes.Error, (socket, packet, args) => {
            Debug.LogError(args[0]);
        });

        m_socket.Socket.On("REQ_REGISTER_PLAYER_RESULT", OnRegisterPlayerResult);
        m_socket.Socket.On("REQ_LEAVE_ROOM_RESULT", OnLeaveRoomResult);
        m_socket.Socket.On("REQ_JOIN_ROOM_RESULT", OnJoinRoomResult);
        m_socket.Socket.On("REQ_ROOMLIST_RESULT", OnRoomListResult);

        m_socket.Socket.On("REQ_GAME_WINNER_RESULT", OnGameWinner);
        m_socket.Socket.On("REQ_GAME_PLAYERS", OnGamePlayers);
        m_socket.Socket.On("REQ_GAME_NEWSTATE", OnGameNewState);
        m_socket.Socket.On("REQ_GAME_COUNTDOWN", OnGameCountDown);
        m_socket.Socket.On("REQ_GAME_ENDTURN", OnGameEndTurn);

        m_socket.Socket.On("REQ_PLAYER_RANK_RESULT", OnPlayerRankResult);
    }

    private void RegisterPlayer()
    {
        Dictionary<string, string> data = new Dictionary<string, string>();

        data["name"] = "" + Global.UserId;

        this.Emit("REQ_REGISTER_PLAYER", data);
    }

    public void CreateRoom(string name, int bot)
    {
        Dictionary<string, string> data = new Dictionary<string, string>();

        data["name"] = "" + name;
        data["bot"] = "" + bot;

        Emit("REQ_CREATE_ROOM", data);
    }

    public void JoinRoom(string roomId)
    {
        Dictionary<string, string> data = new Dictionary<string, string>();

        data["playerid"] = "" + Global.PlayerId;
        data["roomid"] = roomId;

        Emit("REQ_JOIN_ROOM", data);
    }

    public void LeaveRoom()
    {
        Dictionary<string, string> data = new Dictionary<string, string>();

        data["id"] = "" + Global.PlayerId;

        Emit("REQ_LEAVE_ROOM", data);
    }

    public void PlayerAction(string action)
    {
        Dictionary<string, string> data = new Dictionary<string, string>();

        data["id"] = "" + Global.PlayerId;
        data["action"] = action;

        Emit("REQ_PLAYER_ACTION", data);
    }
}