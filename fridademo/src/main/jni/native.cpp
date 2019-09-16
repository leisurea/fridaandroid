//
// Created by WrBug on 2018/3/23.
//
#include "native.h"

#define DEBUG true

void LOGI(const char *tag, const char *fmt,...) {
    if (DEBUG) {
        va_list args;
        va_start(args, fmt);
        __android_log_print(ANDROID_LOG_INFO, tag, fmt, args);
        va_end(args);
    }
}


void LOGW(const char *tag, const char *fmt, ...) {
    if (DEBUG) {
        va_list args;
        va_start(args, fmt);
        __android_log_print(ANDROID_LOG_WARN, tag, fmt, args);
        va_end(args);
    }
}

void LOGE(const char *tag, const char *fmt, ...) {
    if (DEBUG) {
        va_list args;
        va_start(args, fmt);
        __android_log_print(ANDROID_LOG_ERROR, tag, fmt, args);
        va_end(args);
    }
}

int add(int a,int b){
    return a+b;
}

static jstring say(JNIEnv *env, jobject) {
    LOGI("xianger:","native 函数say()返回字符串my jni hhh");
//    string hello = "my jni hhh";
//    return env->NewStringUTF(hello.c_str());
    return env->NewStringUTF("hard to say goodbye");
}
static jstring mystr(JNIEnv *env, jobject,jstring s) {
    char buf[256];
    env->GetStringUTFRegion(s,0,env->GetStringLength(s),buf);
    LOGI("xianger:","GetStringUTFRegion 截取jstring保存到本地buf中：%s",buf);

    const char* ptr_c=env->GetStringUTFChars(s,NULL);
    LOGI("xianger:","GetStringUTFChars 返回const char* 类型：%s",ptr_c);
    env->ReleaseStringUTFChars(s,ptr_c);

    const jchar *wc=env->GetStringChars(s, NULL);
    LOGI("xianger:","GetStringChars 返回const jchar* 类型");
    env->ReleaseStringChars(s,wc);

//    jstring js=env->NewStringUTF(buf);
    //LOGI("NewStringUTF(buf) 返回jstring类型：%s",js);//报错
    return env->NewString(wc,env->GetStringLength(s));
}
static void edit(JNIEnv *env, jobject obj,jint n) {
    jint x=add(n,n);
    LOGI("xianger:","edit()内调用了add()，原参数：%d",n);
    jclass clazz=env->GetObjectClass(obj);
    jfieldID numberid=env->GetFieldID(clazz,"hookGoalNumber","I");
    env->SetIntField(obj,numberid,x);
    LOGI("xianger:","edit()内设置hookGoalNumber字段为：%d",x);

}
static jobjectArray myarray(JNIEnv *env, jobject obj,jobjectArray array){
    jclass diyclass=env->FindClass("cn/kxgz/fridademo/DiyClass");
    jmethodID initid=env->GetMethodID(diyclass,"<init>","(I)V");
    jmethodID getdataid=env->GetMethodID(diyclass,"getData","()I");
    jobject a=env->GetObjectArrayElement(array,0);
    jobject a1=env->GetObjectArrayElement(array,1);
    jint d=env->CallIntMethod(a,getdataid);
    jint d1=env->CallIntMethod(a1,getdataid);
    jobject diy=env->NewObject(diyclass,initid,d);
    jobject diy2=env->NewObject(diyclass,initid,d1);
    jobjectArray myarray=env->NewObjectArray(2,diyclass,0);
    env->SetObjectArrayElement(myarray,0,diy2);
    env->SetObjectArrayElement(myarray,1,diy);
    LOGI("xianger:","myarray()使用array参数，返回交换元素位置的新数组");
    return myarray;
//    return env->NewObjectArray(2,diyclass,diy2);

}

static const char *className = "cn/kxgz/fridademo/HookGoal";

static JNINativeMethod gJni_Methods_table[] = {
        {"editnum", "(I)V", (void*)edit},
        {"sayhello", "()Ljava/lang/String;",(void*)say},
        {"strtest", "(Ljava/lang/String;)Ljava/lang/String;",(void*)mystr},
        {"arraytest","([Lcn/kxgz/fridademo/DiyClass;)[Lcn/kxgz/fridademo/DiyClass;",(void*)myarray}

};

static int jniRegisterNativeMethods(JNIEnv* env, const char* className,
                                    const JNINativeMethod* gMethods, int numMethods)
{
    jclass clazz;

    clazz = (env)->FindClass( className);
    if (clazz == NULL) {
        return -1;
    }

    int result = 0;
    if ((env)->RegisterNatives(clazz, gJni_Methods_table, numMethods) < 0) {
        result = -1;
    }

    (env)->DeleteLocalRef(clazz);
    return result;
}

jint JNI_OnLoad(JavaVM* vm, void* reserved){
    JNIEnv* env = NULL;
    jint result = -1;

    if (vm->GetEnv((void**) &env, JNI_VERSION_1_4) != JNI_OK) {
        return result;
    }
    jniRegisterNativeMethods(env, className, gJni_Methods_table, sizeof(gJni_Methods_table) / sizeof(JNINativeMethod));
    return JNI_VERSION_1_4;
}
