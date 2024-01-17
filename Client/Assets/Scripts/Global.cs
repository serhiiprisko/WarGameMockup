
using UnityEngine;
using LitJson;

public enum ROOM_STATUS {
    NOT_STARTED,
    STARTED,
    STOPPED,
    ENDED
}
public enum JOIN_ERROR_CODE {
    JOIN_SUCCESS,
    JOIN_INVALID_ROOMID,
    JOIN_INVALID_PLAYERID,
    JOIN_FAILED
}

public class Global
{
    public static int PlayerId = -1;
    public static string UserId;
    public static int MyPlayerIndex;
    public static int MyHealShieldCharge;
    public static int MyReflectShieldCharge;
    public static int Rank = -1;

    public static string RoomName = "";
    public static ROOM_STATUS RoomStatus;
    public static int CountDown = -1;
    public static JsonData Players = null;

    public static SocketIO SocketIO;
    public static GameManager GameManager;
    public static GameUIManager GameUIManager;

    public static void DestroyAllChilds(GameObject gObj)
    {
        for (int i = 0; i < gObj.transform.childCount; i++)
            GameObject.Destroy(gObj.transform.GetChild(i).gameObject);
    }

    public static GameObject SpawnPrefab(GameObject prefab, GameObject parent)
    {
        GameObject gObj = (GameObject)GameObject.Instantiate(prefab, parent.transform);
        gObj.transform.localScale = Vector3.one;
        gObj.transform.localPosition = Vector3.zero;

        return gObj;
    }

    public static void FindMyIndex()
    {
        Global.MyPlayerIndex = -1;
        Global.MyHealShieldCharge = 0;
        Global.MyReflectShieldCharge = 0;
        for (int i = 0; i < Global.Players.Count; i++)
        {
            int playerId = System.Convert.ToInt32(Global.Players[i]["id"].ToString());
            if (playerId == Global.PlayerId)
            {
                Global.MyHealShieldCharge = System.Convert.ToInt32(Global.Players[i]["heal_shield_charge"].ToString());
                Global.MyReflectShieldCharge = System.Convert.ToInt32(Global.Players[i]["reflect_shield_charge"].ToString());
                Global.MyPlayerIndex = i;
                break;
            }
        }
    }
}