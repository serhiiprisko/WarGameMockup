
using UnityEngine;
using UnityEngine.UI;

public class RoomInfo : MonoBehaviour
{
    public string m_RoomId;

    [SerializeField]
    private Text m_RoomName;

    public void On_Join_Clicked()
    {
        Global.SocketIO.JoinRoom(m_RoomId);
    }

    public void SetRoomInfo(string roomId, string roomName)
    {
        m_RoomId = roomId;
        m_RoomName.text = roomName;
    }
}
