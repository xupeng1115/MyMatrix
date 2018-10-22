var vm={};


$(function () {
    //绑定数据
    vm={
        PageList:ko.observableArray()
    };
    ko.applyBindings(vm);

    $("body").on("click",".next",function(){
        Matrix.ResizeList(PageList1,vm);
    })

    $("body").on("click",".previous",function(){
        Matrix.ResizeList(PageList,vm);
    })

    //页面初始化渲染
    Matrix.Init(PageList,vm);
});