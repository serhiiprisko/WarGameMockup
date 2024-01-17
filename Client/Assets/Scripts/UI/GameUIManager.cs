using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum UIStatus
{
    UI_LOGIN,
    UI_LOBBY,
    UI_GAME
}

public class GameUIManager : MonoBehaviour
{
    public GameObject m_LoginUI;
    public GameObject m_LobbyUI;

    public UIStatus m_UIStatus = UIStatus.UI_LOGIN;

    private void Awake()
    {
        Global.GameUIManager = this;
    }

    // Start is called before the first frame update
    void Start()
    {
        UpdateUI();
    }

    public void Login()
    {
        m_UIStatus = UIStatus.UI_LOGIN;
        UpdateUI();
    }

    public void Lobby()
    {
        m_UIStatus = UIStatus.UI_LOBBY;
        UpdateUI();
    }

    public void Game()
    {
        m_UIStatus = UIStatus.UI_GAME;
        UpdateUI();
    }

    private void UpdateUI()
    {
        m_LoginUI.gameObject.SetActive(false);
        m_LobbyUI.gameObject.SetActive(false);

        switch (m_UIStatus)
        {
            case UIStatus.UI_LOGIN:
                m_LoginUI.gameObject.SetActive(true);
                break;
            case UIStatus.UI_LOBBY:
                m_LobbyUI.gameObject.SetActive(true);
                break;
            case UIStatus.UI_GAME:
                break;
        }
    }
}