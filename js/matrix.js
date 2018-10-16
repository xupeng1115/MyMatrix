//矩阵对象
var Matrix={
    Init:function(arr,vm){              //初始化绑定矩阵渲染数据
        var  _self=this;
        _self.BindingData(arr,vm);
        _self.InitStyle();
        _self.SetScroll($(".right_div2"));
        _self.WindowResize();
    },
    InitStyle:function(){               //初始化重置矩阵样式
        var _self=this;
        _self.SetTableLine1();
        _self.SetTableLine2();
        _self.SetResizeWidth();
    },
    SetResizeWidth:function(){           //窗口变化时重置基本样式
        var _self=this;
        _self.SetOtherStyle();
        _self.SetRightTable();
    },
    ResizeList:function(arr,vm){        //数据源变化时重新渲染矩阵
        var  _self=this;
        _self.Init(arr,vm);
    },
    BindingData:function(arr,vm){
        for(var i=0;i<arr.length;i++){
            if(arr[i].questiontype==0){
                arr[i].checkoption=ko.observableArray([]);
            }else if(arr[i].questiontype==1){
                for(var j=0;j<arr[i].answers.length;j++){
                    for(var m=0;m<arr[i].answers[j].options.length;m++){
                        arr[i].answers[j].options[m].checkoption=ko.observableArray([]);
                    }
                }
            }
        }
        vm.PageList([]);
        vm.PageList(arr);
    },
    SetTableLine1:function(){               //重置第一行所有table高度一致
        var rightTable1 = $(".right_table1");
        for (var i = 0; i < rightTable1.length; i++) {
            var oHeight = rightTable1.eq(i).height();
            var oLeftTable = rightTable1.eq(i).parents(".right_div").siblings(".left_div").find(".left_table1");
            oLeftTable.css("height", oHeight + 'px');
        }
    },
    SetTableLine2:function(){               //重置第二行table使所有tr高度一致
        var rightTr = $(".right_tr");
        var leftTr = $(".left_tr");
        for (var i = 0; i < leftTr.length; i++) {
            var oHeight = leftTr.eq(i).height();
            rightTr.eq(i).css("height", oHeight + 'px');
        }
    },
    WindowResize:function(){                //监听窗口变化调整滚动条位置
        var _self=this;
        window.onresize = function () {
            _self.SetResizeWidth();
        }
    },
    SetOtherStyle:function(){               //动态设置其他样式
        var oBody = $("body").width();
        if (oBody <= 1000) {
            $(".answer-container").css("width", (oBody-40)+"px");
            $(".list-container").css("padding", "0");

            if (oBody <= 500) {
                $(".progress").css({
                    "width": "100%",
                    "padding": "0 10px"
                });
                $(".answer-header").css({
                    "padding": "6px 10px"
                });
                $(".title").css({
                    "padding": "40px 10px 0 10px"
                });
                $(".logo").css({
                    "right": "50%",
                    "marginRight": "-59px"
                });
                $(".bottom").css({
                    "width": "100px"
                });
            } else {
                $(".progress").css({
                    "width": "400px",
                    "padding": "0"
                });
                $(".answer-header").css({
                    "padding": "6px 0"
                });
                $(".title").css({
                    "paddingTop": "0"
                });
                $(".logo").css({
                    "right": "0",
                    "marginRight": "0"
                });
                $(".bottom").css({
                    "width": "220px"
                });
            }
        } else {
            $(".answer-container").css("width", "1000px");
            $(".list-container").css("padding", "0 80px");
        }
    },
    SetRightTable:function(){                   //动态计算右侧容器宽度使浮动不错位
        var rightDiv = $(".right_div");
        var matrixWidth = $(".matrix").width();
        var oRightTable2=$(".right_table2");
        for (var i = 0; i < rightDiv.length; i++) {
            if(oRightTable2.eq(i).width()<=(matrixWidth-68)){
                rightDiv[i].style.width = (oRightTable2.eq(i).width()) + "px";
            }else{
                rightDiv[i].style.width = (matrixWidth-68) + "px";
            }
        }
    },
    RegisterScroll:function(el){                //注册滚动事件使同维table一起滚动
        el.on("scroll",function (e) {
            var right_div2_top = $(this)[0].scrollTop;
            var right_div2_left = $(this)[0].scrollLeft;
            $(this).parent().siblings(".left_div").find(".left_div2")[0].scrollTop = right_div2_top;
            $(this).parent().find(".right_div1")[0].scrollLeft = right_div2_left;
        });

        //移动端子元素滚动时禁止父元素滚动
        el.on("touchmove", function (e) {
            e.preventDefault();
        });
    },
    SetScroll:function(el){                     //动态设置元素自定义滚动条
        var _self=this;
        //首先删除所有已有的滚动条
        $(".nicescroll-rails").remove();
        //重新设置新的滚动条
        el.niceScroll({
            cursorcolor: "#999", //#CC0071 光标颜色
            cursoropacitymax: 1, //改变不透明度非常光标处于活动状态（scrollabar“可见”状态），范围从1到0
            touchbehavior: false, //使光标拖动滚动像在台式电脑触摸设备
            cursorwidth: "5px", //像素光标的宽度
            cursorborder: "0", // 	游标边框css定义
            cursorborderradius: "5px", //以像素为光标边界半径
            autohidemode: false, //是否隐藏滚动条
            scrollspeed: 4, // 滚动速度
            hwacceleration: true, // 激活硬件加速
            mousescrollstep: 60, // 鼠标滚轮的滚动速度 (像素)
            mousescrollstep: 9 * 8 // 鼠标滚动的滚动速度（像素)
        });

        //让新的滚动条显示
        el.getNiceScroll().show();

        //当窗口改变时重置更新滚动条位置
        el.getNiceScroll().resize();

        //注册矩阵滚动事件,使同维table跟随滚动
        _self.RegisterScroll(el);

    }
}