# fridaandroid
fridademo
1.注释fridademo掉build.gradle的externalNativeBuild
2.运行项目，出现build文件夹里出现Android.mk文件
3.在此文件加上 LOCAL_LDLIBS :=-llog 
注意Android.mk里有一行include $(CLEAR_VARS) 必须把LOCAL_LDLIBS :=-llog放在它后面才有用
4.去掉第一步的注释即可
