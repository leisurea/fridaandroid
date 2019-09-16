package cn.kxgz.fridademo;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

/**
 * https://bbs.pediy.com/thread-252319.htm
 */
public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

    }

    public void onClick(View view) {
        HookGoal h = new HookGoal(0);
        h.editnum(1);
        Log.i("jni str", h.strtest("abcdefg"));
        DiyClass[] array = {new DiyClass(1), new DiyClass(2)};
        Log.i("jni array", "jni调用前 参数数组 成员0: " + array[0].getData() + " 成员1: " + array[1].getData());
        DiyClass[] myarray = h.arraytest(array);
        Log.i("jni array", "jni调用后 返回新数组 成员0: " + myarray[0].getData() + " 成员1: " + myarray[1].getData());
        h.show();
        TextView t = (TextView) findViewById(R.id.tvSam);
        //t.setText("ooo");
        t.setText(h.sayhello());
        //Log.i("jni ","");
        Toast.makeText(MainActivity.this, "HOOKGOAL", Toast.LENGTH_LONG).show();
    }
}
