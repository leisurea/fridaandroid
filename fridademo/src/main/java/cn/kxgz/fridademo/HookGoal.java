package cn.kxgz.fridademo;

import android.util.Log;

/**
 * Created by leisure on 2019/9/10.
 */

public class HookGoal {
    static {
        System.loadLibrary("native");
    }

    private static String TAG = "HookGoal:";
    private int hookGoalNumber;

    public HookGoal(int number) {
        hookGoalNumber = number;
        Log.i(TAG, "HookGoal hookGoalNumber:" + hookGoalNumber);
    }

    public void func0() {
        Log.i(TAG, "welcome");
    }

    private void func1() {
        new person() {
            @Override
            public void eat(String food) {
                Log.i(TAG, "eat " + food);
            }
        }.eat("apple");
    }

    private static void func2(String s) {
        Log.i(TAG, "func2 " + s);
    }

    private void func3(DiyClass[] arry) {
        for (int i = 0; i < arry.length; i++)
            Log.i(TAG, "DiyClass[" + i + "].getData:" + arry[i].getData());
    }

    private class InnerClass {
        private int innerNumber;

        public InnerClass(String s) {
            innerNumber = 0;
            Log.i(TAG, "InnerClass 构造函数 " + s);
            Log.i(TAG, "InnerClass innerNumber:" + innerNumber);
        }

        private void innerFunc(String s) {
            Log.i(TAG, "InnerClass innerFunc " + s);
        }
    }

    public native String sayhello();

    public native String strtest(String s);

    public native DiyClass[] arraytest(DiyClass[] array);

    public native void editnum(int n);

    public void show() {
        Log.i(TAG, "hookGoalNumber:" + hookGoalNumber);
        func1();
        func2("私有静态方法");
        DiyClass[] arry = {new DiyClass(0), new DiyClass(0), new DiyClass(0)};
        func3(arry);
        InnerClass inner = new InnerClass("私有内部类");
        inner.innerFunc("内部类方法调用");
    }

}

