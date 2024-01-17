using System;

using UnityEngine;
using UnityEngine.UI;

public class CreateRoomUIManager : MonoBehaviour
{
    public InputField m_InputField_RoomName;
    public Toggle m_Toggle_Bot;

    public void On_CreateRoom_Clicked()
    {
        string name = m_InputField_RoomName.text;
        bool bot = m_Toggle_Bot.isOn;

        Global.SocketIO.CreateRoom(name, bot ? 1 : 0);
    }
}
