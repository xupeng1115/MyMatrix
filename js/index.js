
$(function () {
    //绑定数据
    var vm={
        PageList:ko.observableArray()
    };
    ko.applyBindings(vm);

    $("body").on("click",".next",function(){
        Matrix.resizeList(PageList,vm);
    })

    $("body").on("click",".previous",function(){
        Matrix.resizeList(PageList2,vm);
    })

    //页面初始化渲染
    Matrix.Init(PageList,vm);
});