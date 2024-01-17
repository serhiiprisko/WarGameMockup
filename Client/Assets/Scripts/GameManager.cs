using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

using LitJson;

public class GameManager : MonoBehaviour
{
    public Text m_CountDownText;

    public GameObject m_Player1_Buttons;
    public Text m_Player1_Text;
    public Text m_Player1_Heal_Charge_Text;
    public Text m_Player1_Reflect_Charge_Text;
    public Text m_Player1_Action_Text;

    public GameObject m_Player2_Buttons;
    public Text m_Player2_Text;
    public Text m_Player2_Heal_Charge_Text;
    public Text m_Player2_Reflect_Charge_Text;
    public Text m_Player2_Action_Text;

    public GameObject m_NotStartedUI;
    public GameObject m_StoppendUI;
    public GameObject m_EndedUI;

    private void Awake()
    {
        Global.GameManager = this;
    }

    public void RefreshUI()
    {
        m_NotStartedUI.SetActive(Global.RoomStatus == ROOM_STATUS.NOT_STARTED);
        m_StoppendUI.SetActive(Global.RoomStatus == ROOM_STATUS.STOPPED);
        m_EndedUI.SetActive(Global.RoomStatus == ROOM_STATUS.ENDED);

        m_Player1_Buttons.SetActive(Global.MyPlayerIndex == 0);
        m_Player2_Buttons.SetActive(Global.MyPlayerIndex == 1);

        m_CountDownText.text = Global.RoomName;
        if (Global.CountDown >= 0)
            m_CountDownText.text = m_CountDownText.text + ": " + Global.CountDown.ToString();

        JsonData p1 = null, p2 = null;
        if (Global.Players.Count >= 1)
            p1 = Global.Players[0];
        if (Global.Players.Count >= 2)
            p2 = Global.Players[1];

        m_Player1_Text.gameObject.SetActive(p1 != null);
        m_Player1_Heal_Charge_Text.gameObject.SetActive(p1 != null);
        m_Player1_Reflect_Charge_Text.gameObject.SetActive(p1 != null);
        if (p1 != null)
        {
            m_Player1_Text.text = p1["name"].ToString() + ": " + p1["health"].ToString();
            m_Player1_Heal_Charge_Text.text = "+" + p1["heal_shield_charge"].ToString();
            m_Player1_Reflect_Charge_Text.text = "+" + p1["reflect_shield_charge"].ToString();
        }

        m_Player2_Text.gameObject.SetActive(p2 != null);
        m_Player2_Heal_Charge_Text.gameObject.SetActive(p2 != null);
        m_Player2_Reflect_Charge_Text.gameObject.SetActive(p2 != null);
        if (p2 != null)
        {
            m_Player2_Text.text = p2["name"].ToString() + ": " + p2["health"].ToString();
            m_Player2_Heal_Charge_Text.text = "+" + p2["heal_shield_charge"].ToString();
            m_Player2_Reflect_Charge_Text.text = "+" + p2["reflect_shield_charge"].ToString();
        }
    }

    private void EnableButtons(bool enable)
    {
        GameObject btns = null;
        if (Global.MyPlayerIndex == 0) btns = m_Player1_Buttons;
        if (Global.MyPlayerIndex == 1) btns = m_Player2_Buttons;
        if (btns != null)
        {
            foreach(Button btn in btns.GetComponentsInChildren<Button>())
            {
                btn.interactable = enable;
            }
        }
    }

    public void NewRound()
    {
        EnableButtons(true);
    }

    public void WinningResult(string result)
    {
        m_EndedUI.SetActive(true);
        m_EndedUI.transform.GetChild(0).GetComponent<Text>().text = result;
    }

    public void EndTurn(string action1, string action2)
    {
        m_Player1_Action_Text.gameObject.SetActive(false);
        m_Player2_Action_Text.gameObject.SetActive(false);
        m_Player1_Action_Text.gameObject.SetActive(true);
        m_Player2_Action_Text.gameObject.SetActive(true);
        m_Player1_Action_Text.text = action1;
        m_Player2_Action_Text.text = action2;
    }

    public void On_Leave_Clicked()
    {
        Global.SocketIO.LeaveRoom();
    }

    public void On_Shoot_Clicked(int index)
    {
        if (Global.MyPlayerIndex != index) return;
        if (Global.RoomStatus != ROOM_STATUS.STARTED) return;
        EnableButtons(false);
        Global.SocketIO.PlayerAction("shoot");
    }

    public void On_Heal_Clicked(int index)
    {
        if (Global.MyPlayerIndex != index) return;
        if (Global.RoomStatus != ROOM_STATUS.STARTED) return;
        EnableButtons(false);
        Global.SocketIO.PlayerAction("heal");
    }

    public void On_Heal_Shield_Clicked(int index)
    {
        if (Global.MyPlayerIndex != index) return;
        if (Global.RoomStatus != ROOM_STATUS.STARTED) return;
        if (Global.MyHealShieldCharge <= 0) return;
        EnableButtons(false);
        Global.SocketIO.PlayerAction("healShield");
    }

    public void On_Reflect_Shield_Clicked(int index)
    {
        if (Global.MyPlayerIndex != index) return;
        if (Global.RoomStatus != ROOM_STATUS.STARTED) return;
        if (Global.MyReflectShieldCharge <= 0) return;
        EnableButtons(false);
        Global.SocketIO.PlayerAction("reflectShield");
    }

    public void On_EndedUI_Ok_Clicked()
    {
        Global.GameUIManager.Lobby();
    }
}