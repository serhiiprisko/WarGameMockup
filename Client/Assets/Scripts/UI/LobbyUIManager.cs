using System;
using UnityEngine;
using UnityEngine.UI;

using LitJson;

public class LobbyUIManager : MonoBehaviour
{
    public Text m_UserId;
    public Text m_UserRanking;

    public RectTransform m_RoomContent;
    public GameObject m_RoomItemPrefab;

    private void OnEnable()
    {
        m_UserId.text = Global.UserId;
    }
    public void RefreshRooms(JsonData json)
    {
        if (gameObject.activeSelf == false)
            return;

        Global.DestroyAllChilds(m_RoomContent.gameObject);

        int count = json.Count;

        m_RoomContent.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, 100 * count);
        for (int i = 0; i < count; i++)
        {
            RoomInfo roomInfo = Global.SpawnPrefab(m_RoomItemPrefab, m_RoomContent.gameObject).GetComponent<RoomInfo>();

            roomInfo.SetRoomInfo(json[i]["id"].ToString(), json[i]["name"].ToString());
        }
    }

    void Update()
    {
        string division = "Gold";
        if (Global.Rank <= 100) division = "Iron";
        string ranking = "" + Global.Rank + " (" + division + ")";
        if (Global.Rank <= 0) ranking = "New";
        m_UserRanking.text = ranking;
    }
}
