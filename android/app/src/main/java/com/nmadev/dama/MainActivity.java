package com.nmadev.dama;

import android.widget.Toast;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private long lastBackPressedTime;
    private static final int BACK_PRESS_INTERVAL = 2000;

    @Override
    public void onBackPressed() {
        if (getBridge().getWebView().canGoBack()) {
            getBridge().getWebView().goBack();
        } else {
            if (lastBackPressedTime + BACK_PRESS_INTERVAL > System.currentTimeMillis()) {
                super.onBackPressed();
                return;
            } else {
                Toast.makeText(getBaseContext(), "بۆ چوونە دەرەوە دووجار کلیك لە دوگمەی گەڕانەوە بکە", Toast.LENGTH_SHORT).show();
            }
            lastBackPressedTime = System.currentTimeMillis();
        }
    }
}
