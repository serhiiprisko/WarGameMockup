using System;
using UnityEngine;

using UnityEngine.UI;

public class LoginUIManager : MonoBehaviour
{
    public InputField m_InputField_ServerIp;
    public InputField m_InputField_UserName;

    public void On_Login_Clicked()
    {
        Global.UserId = m_InputField_UserName.text;

        Global.SocketIO.ConnectToServer(m_InputField_ServerIp.text);
    }
}
