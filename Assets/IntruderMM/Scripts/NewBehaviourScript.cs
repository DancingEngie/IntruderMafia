using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class NewBehaviourScript : MonoBehaviour {
    public GUIStyle style;

    private void OnGUI()
    {
            GUI.Label(new Rect(10, 10, 100, 20), "Hey Rob, you can actually do stuff with scripts.", style);
    }
}
