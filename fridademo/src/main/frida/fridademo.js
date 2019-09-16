setImmediate(function () {
    Java.perform(function () {
        console.log("好戏开场了");
        var TAG = "fridajs== ";
        ///////////////////////java 层hook///////////////////////
        var HookGoal = Java.use("cn.kxgz.fridademo.HookGoal");
        var clazz = Java.use("java.lang.Class");
        var str = Java.use("java.lang.String");

        HookGoal.$init.overload("int").implementation = function (number) {
            send(TAG + "HookGoal 构造函数hook，原始参数number：" + number);
            send(TAG + "HookGoal 构造函数hook，修改后的number：666");
            return this.$init(666);
        };

        //hook静态变量,cast获取类类型,然后反射拿到TAG属性
        var reflectField = Java.cast(HookGoal.class, clazz).getDeclaredField("TAG");
        reflectField.setAccessible(true);
        reflectField.set("java.lang.String", "frida hooking ");
        //直接hook拿值
        send(TAG + "HookGoal 反射修改TAG的值：" + HookGoal.TAG.value);


        //实例化对象方法一
        var aone = HookGoal.$new(0);
        send(TAG + "实例化对象方法$new：" + aone);
        var atwo = HookGoal.$new.overload("int").call(HookGoal, 0);
        send(TAG + "实例化对象方法$int.overload：" + atwo);


        //hook匿名内部类，修改参数fun1函数的内部匿名person类
        var fun1_inner = Java.use("cn.kxgz.fridademo.HookGoal$1");
        fun1_inner.eat.overload("java.lang.String").implementation = function (name) {
            var arg = arguments[0];
            send(TAG + "eat参数获取方式一：" + arg);
            send(TAG + "eat参数获取方式二：" + name);
            return this.eat("eat is hooking");
        }

        var diy = Java.use("cn.kxgz.fridademo.DiyClass");
        HookGoal.func2.implementation = function (s) {
            var arg = arguments[0];
            send(TAG + "func2()参数获取：" + s);
            aone.func0();
            send("func2()内调用func0()  通过创建实例aone调用");
            atwo.func0();
            send("func2()内调用func0()  通过创建实例atwo调用");

            //修改实例的hookGoalNumber值，前面hook构造函数时已经将值改为666
            //修改字段值 通过反射得到字段，
            var num1 = Java.cast(HookGoal.class, clazz).getDeclaredField("hookGoalNumber");
            num1.setAccessible(true);
            send("实例aone的hookGoalNumber:" + num1.get(aone));
            num1.setInt(aone, 777);
            send("修改实例aone的hookGoalNumber:" + num1.get(aone));

            send("实例atwo的hookGoalNumber:" + num1.get(atwo));

            //通过反射调用方法
            var func = HookGoal.class.getDeclaredMethod("func0", null);
            send(TAG + "func0:" + func);
            func.invoke(atwo, null);
            send(TAG + "func2()内调用func0()  way2 通过反射调用");

            //调用DiyClass内的getData()
            var d = diy.$new(666);
            var x = d.getData();
            send("func2()内调用DiyClass下的getData() 通过创建实例d调用 返回：" + x);
            //修改func2的参数
            return this.func2("is hooking");
        }

        //修改func参数
        HookGoal.func3.implementation = function (array) {
            //在成员方法func3内调用func0
            this.func0();
            send(TAG + "func3()内调用func0() 成员方法中直接调用其它成员方法");
            send(TAG + "func3()参数：" + array);
            var a = Java.array("cn.kxgz.fridademo.DiyClass", [diy.$new(111), diy.$new(222), diy.$new(333)]);
            send(TAG + "func3()参数即将改为：" + a);
            return this.func3(a);
        }


        //hook内部类-构造方法参数需要加上父类类名
        var inner = Java.use("cn.kxgz.fridademo.HookGoal$InnerClass");
        //hook内部类的构造方法
        inner.$init.overload("cn.kxgz.fridademo.HookGoal", "java.lang.String").implementation = function (fatherClz, arg) {
            send(TAG + "innerClass构造方法的参数：" + arg);
            return this.$init(fatherClz, "innerClass is hooking")
        }
        //hook内部类的方法
        inner.innerFunc.implementation = function (s) {
            send(TAG + "hook 内部类方法innerFunc()的参数:" + arguments[0]);
            var num = inner.class.getDeclaredField("innerNumber");
            num.setAccessible(true);

            //多种方式获取，修改成员变量的值
            send(TAG + "通过this.innerNumber.value获取值：" + this.innerNumber.value);
            this.innerNumber.value = 11;
            send(TAG + "通过this.innerNumber.value设置后的值：" + this.innerNumber.value);

            send(TAG + "通过反射方式获取到innerNumber的值：" + num.get(this));
            num.setInt(this, 22);
            send(TAG + "通过反射方式获取到修改后innerNumber的值：" + num.get(this));
            return this.innerFunc("innerFunc is hooking");
        }

        ///////////////////////so层hook///////////////////////////////////
        ///////////////////////用真机测试，模拟器找不到so////////////////////
        //到处函数
        // var gggg = Module.enumerateExportsSync("libnative.so");
        // send(TAG+gggg.length);
        // gggg.forEach(element => {
        //     send(TAG + "so导出函数： name:" + element.name + "  address:" + element.address);
        // });

        // var getString = undefined;
        var i = undefined;
        var exports = Module.enumerateExportsSync("libnative.so");
        for (i = 0; i < exports.length; i++) {
            // if (exports[i].name == "Java_com_example_hooktest_MainActivity_getString") {
            //     var getString = exports[i].address;
            //     send("getInt is at " + getString);
            //     break;
            // }
            // send("ggggggggggg:" + exports[i].name);
        }

        //遍历模块找基址
        Process.enumerateModules({
            onMatch: function (exp) {
                if (exp.name == 'libnative.so') {
                    send(TAG + "enumerateModules find: " + exp.name + " |  " + exp.base + " | " + exp.size + " | " + exp.path);
                    send(exp);
                    return 'stop';
                }
            },
            onComplete: function () {
                send("enumerateModules stop");
            }
        });



        ///////多种方法hook native 方法/////

        //方法一,ida里肉眼逮到add方法的方法名
        //        var nativePointer = Module.findExportByName("libnative.so", "_Z3addii");
        //        Interceptor.attach(nativePointer, {
        //            onEnter: function (args) {
        //                send("onEnter add()");
        //                var x = args[0];
        //                var y = args[1];
        //                args[0] = ptr(x * 2);
        //                args[1] = ptr(y * 2);
        //                send("hook add()修改参数为原来的两倍 args[0]:" + args[0].toInt32() + "  args[1]:" + args[1].toInt32());
        //            },
        //            onLeave: function (retval) {
        //                send("onLeave  add()");
        //                //retval.replace(678);
        //                //send("add()修改返回值为："+retval.toInt32())
        //            }
        //
        //        });

        //方法二

        //通过模块名直接查找基址
        var soAddr = Module.findBaseAddress("libnative.so");
        send(TAG + "通过模块名直接查找基址:" + soAddr);

        //下面为x86模拟器中地址偏移  arm真机下thumb指令下地址+1
        var fadd = 0x101C;//在ida用肉眼观测得到add方法在文件中的偏移地址
        var fsay = 0x1290;//打开字符窗口，
        var fedit = 0x120C;//
        var fmystr = 0x12C8;
        var fmyarray = 0x13BC;

        //so文件地址+方法偏移地址+1
        var faddptr = new NativePointer(soAddr).add(fadd + 1);
        send(TAG + "函数add() faddptr:" + faddptr);

        //逮到方法真实地址就可以直接调用，调用add（5，6）
        var funadd = new NativeFunction(faddptr, "int", ['int', 'int']);
        var t = funadd(5, 6);
        send("调用native 方法fun():" + t);
        //hook add()方法
        Interceptor.attach(faddptr, {
            onEnter: function (args) {
                send("onEnter add()");
                var x = args[0];
                var y = args[1];

                //参数修改使用new NativePointer(s)  简写ptr(s)
                args[0] = ptr(x * 2);
                args[1] = ptr(y * 2);
                send("hook add()修改参数为原来的两倍 args[0]:" + args[0].toInt32() + "  args[1]:" + args[1].toInt32());
            },
            onLeave: function (retval) {
                send("onLeave  add()");
                //retval.replace(678);
                //send("add()修改返回值为："+retval.toInt32())
            }

        });

        //hook say方法,修改返回值
        var fsayptr = new NativePointer(soAddr).add(fsay + 1);
        Interceptor.attach(fsayptr, {
            onEnter: function (args) {
                send(TAG + "onEnter say()");
            },
            onLeave: function (retval) {
                send(TAG + "onLeave say()");
                //jstring类型无法直接输出显示，可以类型转换到java.lang.String
                var s = Java.cast(retval, str);
                send(TAG + "say()方法原来返回值：" + s);
                //调用env下的方法，构造jstring类型
                var env = Java.vm.getEnv();
                var jstring = env.newStringUtf("how could i tell you");
                retval.replace(ptr(jstring));
                send(TAG + "say()方法修改后的返回值：" + + Java.cast(jstring, str));
            }
        });

        //hook edit方法，修改参数
        var feditptr = new NativePointer(soAddr).add(fedit + 1);
        Interceptor.attach(feditptr, {
            onEnter: function (args) {
                send(TAG + "onEnter edit()");
                send(TAG + "edit() env：" + args[0] + "  jobject：" + args[1] + " jint:" + args[2].toInt32());

                //参数修改使用new NativePointer(s) 简写ptr(s)
                args[2] = ptr(4);
                send(TAG + "hook edit() 修改后的参数jint：" + args[2]);
            },
            onLeave: function (retval) {
                send(TAG + "onLeave edit()");
            }
        });

        //hook mystr方法,修改返回值
        var fmystrptr = new NativePointer(soAddr).add(fmystr + 1);
        Interceptor.attach(fmystrptr, {
            onEnter: function (args) {
                send(TAG + "onEnter mystr()");
                send(TAG + "mystr() env：" + args[0] + "  jobject：" + args[1] + " jstring:" + args[2]);
                var s = Java.cast(args[2], str);
                send(TAG + "mystr() jstring参数：" + s);
            },
            onLeave: function (retval) {
                send(TAG + "onLeave mystr()");
                var env = Java.vm.getEnv();
                var jstring = env.newStringUtf("一路向北");
                send(TAG + "修改mystr()返回值：" + jstring);
                retval.replace(ptr(jstring));
            }
        });

        //hook myarray,修改返回数组
        var myarrayptr = new NativePointer(soAddr).add(fmyarray + 1);
        var argptr;
        Interceptor.attach(myarrayptr, {
            onEnter: function (args) {
                send(TAG + "onEnter myarray()");
                send(TAG + "mystr() env：" + args[0] + "  jobject：" + args[1] + " jobjectArray:" + args[2]);
                send(TAG + "jobjectArray参数：" + args[2].toString());
                this.argptr = args[2];

            },
            onLeave: function (retval) {
                send(TAG + "onLeave myarray()");
                send(TAG + "argptr:" + this.argptr);

                // jclass diyclass=env->FindClass("cn/kxgz/fridademo/DiyClass");
                // jmethodID initid=env->GetMethodID(diyclass,"<init>","(I)V");
                // jmethodID getdataid=env->GetMethodID(diyclass,"getData","()I");
                // jobject a=env->GetObjectArrayElement(array,0);
                // jobject a1=env->GetObjectArrayElement(array,1);
                // jint d=env->CallIntMethod(a,getdataid);
                // jint d1=env->CallIntMethod(a1,getdataid);
                // jobject diy=env->NewObject(diyclass,initid,d);
                // jobject diy2=env->NewObject(diyclass,initid,d1);
                // jobjectArray myarray=env->NewObjectArray(2,diyclass,0);
                // env->SetObjectArrayElement(myarray,0,diy2);
                // env->SetObjectArrayElement(myarray,1,diy);


                var env = Java.vm.getEnv();
                var cla = env.findClass("cn/kxgz/fridademo/DiyClass");
                var initid = env.getMethodId(cla, "<init>", "(I)V");
                var setid = env.getMethodId(cla, "setData", "(I)V");
                var getid = env.getMethodId(cla, "getData", "()I");

                //调用env中的allocObject()方法创建对象，未初始化，
                var obj1 = env.allocObject(cla);
                var obj2 = env.allocObject(cla);
                //创建长度为2的数组
                var rtarray = env.newObjectArray(2, cla, ptr(0));
                send(TAG + "env.newObjectArray:" + rtarray);

                //获取DiyClass类中public void setData(int data)方法
                var nvmethod = env.nonvirtualVaMethod("void", ["int"]);
                //设置obj1与obj2的值
                nvmethod(env, obj1, cla, setid, 55);
                nvmethod(env, obj2, cla, setid, 66);

                //数组赋值
                env.setObjectArrayElement(rtarray, 0, obj1);
                env.setObjectArrayElement(rtarray, 1, obj2);
                send(TAG + "env.setObjectArrayElement赋值结果：" + rtarray);

                send(TAG + "修改前返回值：" + retval);
                retval.replace(ptr(rtarray));
                send(TAG + "修改后返回值：" + retval);

            }
        });

    });
});