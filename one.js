var isMobile = /Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
var __listData = null,//所有数据
    __curQuestionnaire = 0,//默认问卷索引
    __curQuestion = 0,//默认页索引
    __curQuestionIndex = 0,
    __prevIndex = [{ curQuestionnaire: 0, curQuestion: 0, curQuestionIndex: 0 }],
    __answerList = [],//答题记录
    uid = null;
var __projectId = $("#hidProjectId").val(),
    __userCode = $("#hidUserCode").val(),
    __language = $("#hidLanguage").val(),
    __clientCode = $("#hidClientCode").val();
var curkey = "curContent" + "-" + __projectId + "-" + __userCode + "-" + __language + "-" + __clientCode;
$(document).ready(function () {
    var viewModel = {
        currentProgress: ko.observable(0),//当前进度
        pageList: ko.observableArray([]),//页面渲染数据
        questionnaireTitle: ko.observable(""),
        currentLan: ko.observable(vxJsonLang.Answer),//多语言
        startText: ko.observable(""),//序号起始显示文字
        helpText: ko.observable(""),//帮助
        showHelp: ko.observable(false),//是否显示帮助
        isOpenLuck: ko.observable(false),//是否抽奖
        isOpenCode: ko.observable(false),//是否验证码
        qStartOne: ko.observable(false),//每页是否从起始开始
        logImg: ko.observable(""),//公司Logo
        randCode: ko.observable(""),//验证码
        inputCode: ko.observable(""),//验证码输入框
        waterMark: ko.observable(""),//水印
        showPrev: ko.observable(false),//上一页
        showCode: ko.observable(false),//验证码
        isShowMessage: ko.observable(false),
        showMessage: ko.observable(false),
        mobileImg: ko.observable(""),
        status: ko.observable(0),
        link: ko.observable(""),
        answerRecordList: ko.observableArray([]),
        questionSum: ko.observable(100),
        questionNoanswercount: ko.observable(100),
        questionListAnswer: ko.observable([]),
        isMobile: ko.observable(isMobile),      //是否是移动端
        isExtend: ko.observable(true),          //是否展开矩阵题checkbox选项区
        isExtendText:ko.observable('收起'),     //展开选项文本
        getPageList: function () {
            var that = this;
            var pageList = __listData;
            var index = 1;
            var op = __prevIndex;
            var curQIndex = -1;
            if (op != null && pageList.length > 0) {
                for (var i = 0; i < op.length; i++) {
                    if (op[i].curQuestionnaire != curQIndex) {
                        if (that.qStartOne()) index = 1;
                    }

                    var curQ = pageList[op[i].curQuestionnaire];//当前问卷
                    var curJ = curQ.PageList[op[i].curQuestion]; 
                    if (curJ != null) {
                        for (var j = 0; j < curJ.length; j++) {
                            if (j >= op[i].curQuestionIndex) {
                                curJ[j].shownum(that.startText() + index + '.');
                                if (curJ[j].questiontype != 4)
                                    index++;

                            }
                        }
                    }
                    curQIndex = op[i].curQuestionnaire;//当前问卷
                }

                var curQuestionnaire = op[op.length - 1].curQuestionnaire;
                var curQuestion = op[op.length - 1].curQuestion;
                var curQuestionIndex = op[op.length - 1].curQuestionIndex;
                that.questionnaireTitle(__listData[curQuestionnaire].QuestionnaireName);
                if (curQuestionnaire == __listData.length - 1 && curQuestion == __listData[curQuestionnaire].PageList.length - 1) {
                    that.showCode(true);
                    that.randCode("/SurveyAnswer/SVSurveyAnswer/ShowValidateCode?time=" + (new Date()).getTime());

                }
                else
                    that.showCode(false);
                if (curQuestion == 0 && curQuestionnaire == 0)
                    that.showPrev(true);
                else
                    that.showPrev(true);

                var clist = pageList[curQuestionnaire].PageList[curQuestion];
                //逻辑题排除跳过的题目
                var oq = [];
                if (curQuestionIndex > 0) {
                    for (var l = 0; l < clist.length; l++) {
                        if (l >= curQuestionIndex) {
                            oq.push(clist[l]);
                        }
                    }
                } else
                    oq = clist;

                that.pageList(oq);
                
                
            }

        },
        SetMatrixList: function () {
            var arr = $.extend([], viewModel.pageList());
            var oData = Matrix.ProcessMatrixData(Data1);
            arr.push(oData);

            viewModel.pageList([]);
            viewModel.pageList(arr);
            //数据绑定后，设置矩阵题样式(包括矩阵题，滚动条，固定行和列,必填验证)
            Matrix.SetMatrix(0, viewModel.pageList());
        },
        //矩阵题行选择框收起和展开
        MatrixExtend: function () {
            if (viewModel.isExtend()) {
                viewModel.isExtend(false);
                viewModel.isExtendText('展开');
            } else {
                viewModel.isExtend(true);
                viewModel.isExtendText('收起');
            }

            //重置滚动条位置
            $(".right_div2").getNiceScroll().resize();
        },
        //矩阵题行选择框功能
        MatrixChangeOption: function (index, data) {

            setTimeout(function () {
                viewModel.SetMatrixChangeOption(index, data);

                var arr = $.extend([], viewModel.pageList());
                viewModel.pageList([]);
                viewModel.pageList(arr);

                //重置滚动条样式和矩阵列表样式
                Matrix.SetTableLine1();
                Matrix.SetTableLine2();
                Matrix.SetRightTable();
                Matrix.SetScroll($(".right_div2"));
            },0)

            return true;
        },
        SetMatrixChangeOption: function (index, data) {

            var selectcheckbox = viewModel.pageList()[index].selectcheckbox();
            var leftoption = viewModel.pageList()[index].leftcheckbox;
            var selectoption = viewModel.pageList()[index].selectoption;

            if (selectcheckbox.length > leftoption.length) {
                viewModel.pageList()[index].leftcheckbox.push(data);
            } else {
                for (var i = 0; i < leftoption.length; i++) {
                    if (leftoption[i].questionid == data.questionid) {
                        viewModel.pageList()[index].leftcheckbox.splice(i, 1);
                    }
                }
            }

            if (viewModel.pageList()[index].selectoption.length > selectcheckbox.length) {
                for (var m = 0; m < viewModel.pageList()[index].selectoption.length; m++) {
                    if (viewModel.pageList()[index].selectoption[m].leftdepartmentid == data.questionid) {
                        viewModel.pageList()[index].selectoption.splice(m, 1);
                    }
                }
            } else {
                var option1 = [], option2 = [];
                var topoption = viewModel.pageList()[index].topdepartoption;
                var suboption = viewModel.pageList()[index].option;

                for (var a = 0; a < suboption.length; a++) {
                    var obj1 = {};
                    obj1 = {
                        optionid: suboption[a].id,
                        optionname: suboption[a].optionname
                    }
                    option1.push(obj1);
                }

                for (var b = 0; b < topoption.length; b++) {
                    var obj2 = {};
                    obj2.checkoption = ko.observable();
                    obj2.topdepartmentid = topoption[b].questionid;
                    obj2.option = option1;
                    option2.push(obj2);
                }

                var obj3 = {
                    leftdepartmentid: data.questionid,
                    leftdepartmentname: data.questionname,
                    option: option2
                }
                viewModel.pageList()[index].selectoption.push(obj3);

            }
            
        },
        isSubmitTip: ko.observable(false),
        projectmethod: ko.observable(0),
        submitTip: ko.observable("确定提交吗"),
        //必填项判断
        validateRequired: function () {
            var flag = true;
            var list = viewModel.pageList();
            for (var i = 0; i < list.length; i++) {
                if (list[i].questiontype == 1 || list[i].questiontype == 0) {
                    if (list[i].isrequired) {
                        if (list[i].questiontype == 0 || list[i].questiontype == 1) {

                            if (list[i].displaystyle == 2 && list[i].checkoption() == undefined) {
                                list[i].showerror(true);
                                flag = false;
                            }
                            else if (list[i].checkoption().length == 0 || list[i].checkoption() == undefined) {
                                list[i].showerror(true);
                                flag = false;
                            } else {
                                list[i].showerror(false);
                            }
                        }
                    }
                }
                else if (list[i].questiontype == 2) {

                    var checkOption = list[i].checkoption();
                    //必填项
                    if ( !list[i].isrequired&&!list[i].isrequiredoption) {
                          list[i].showMinmassage('');
                          list[i].showerror(false);
                    }
                    else   if (checkOption.length == 0 && list[i].isrequired) {
                        flag = false;
                        list[i].showerror(true);
                    } else {
                        var option = list[i].option;//选项
                        if (option.length == 0 && checkOption.length > 0) {
                            list[i].showMinmassage('');
                            list[i].showerror(false);
                        }
                        if (option.length > 0) {
                            if (list[i].isrequiredoption) {
                            for (var m = 0; m < checkOption.length; m++) {
                                for (var n = 0; n < option.length; n++) {
                                    if (checkOption[m] == option[n].id) {
                                       
                                            if (option[n].anslist() == "" || option[n].anslist() == null) {
                                                list[i].showMinmassage('');
                                                list[i].showerror(true);
                                                flag = false;
                                            }
                                        }
                                    }

                                }
                            }
                    }
                }



                } else if (list[i].questiontype == 3) {

                    var option = list[i].option;//选项

                    var sortList =[];
                    for (var n = 0; n < option.length; n++) {
                        if (option[n].anslist() != "")
                            sortList.push(option[n].anslist());
                }
                    //必填项未答
                    if (list[i].isrequired && sortList.length == 0) {
                        list[i].showerror(true); flag = false;

                    }
                    else if (sortList.length > 0 && sortList.length != option.length) {

                        list[i].showerror(true); flag = false;
                    }

                    else list[i].showerror(false);
                }
                if (list[i].questiontype == 1) {
                    if (list[i].checkoption().length > 0) {
                        if (list[i].multiminnum > 0 && list[i].multiminnum > list[i].checkoption().length) {
                            list[i].showMinmassage(vxJsonLang.Answer.CheckMinNum.replace("{0}", list[i].multiminnum));
                            list[i].showerror(true);
                            flag = false;
                        } else if (list[i].multimaxnum > 0 && list[i].multimaxnum < list[i].checkoption().length) {

                            list[i].showMinmassage(vxJsonLang.Answer.CheckMaxNum.replace("{0}", list[i].multimaxnum));
                            list[i].showerror(true);
                            flag = false;
                        } else {
                            list[i].showerror(false);
                            list[i].showMinmassage('');
                        }
                    }
                }
                //必填的开放题，切已经验证过必填项
                if (list[i].questiontype == 2 && !list[i].showerror()) {

                    if (list[i].checkoption().length > 0) {
                        if (list[i].multiminnum > 0 && list[i].multiminnum > list[i].checkoption().length) {
                            list[i].showMinmassage(vxJsonLang.Answer.CheckMinNum.replace("{0}", list[i].multiminnum));
                            list[i].showerror(true);
                            flag = false;
                        } else if (list[i].multimaxnum > 0 && list[i].multimaxnum < list[i].checkoption().length) {

                            list[i].showMinmassage(vxJsonLang.Answer.CheckMaxNum.replace("{0}", list[i].multimaxnum));
                            list[i].showerror(true);
                            flag = false;
                        } else {
                            list[i].showerror(false);
                            list[i].showMinmassage('');
                        }
                    }
                }

                //验证并设置矩阵题
                if (list[i].questiontype == 5 && list[i].isrequired) {
                    
                    if (!Matrix.RequiredMatrix(list[i])) {
                        list[i].showerror(true);
                        flag = false;
                    } else {
                        list[i].showerror(false);
                        list[i].showMinmassage('');
                    }
                }

                if (list[i].showerror()) {
                    flag = false;
                }
                
            }


            return flag;

        },
        //用于开放题非必填项判断
        validateSort: function () {

            var pdata = this.parentData;
            var data = this.data.anslist();

            if (pdata.isrequiredoption && (data == "" || data == undefined)) {               
                pdata.showerror(true);
            }           
            else
                pdata.showerror(false);
            viewModel.saveAnswerlocalStorage();
        },

        changeOptionClick: function () {
            var pdata = this.pdata;
            var data = this.data;

            var optionList = pdata.checkoption();
            if (!pdata.isrequired && !pdata.isrequiredoption) {
                pdata.showerror(false);
                pdata.showMinmassage('');
                viewModel.saveAnswerlocalStorage();
                return true;
            }

            setTimeout(function () {

                if (optionList.length == 0&&pdata.isrequired) {
                    pdata.showerror(true);
                }                    //else if (optionList.indexOf(this.data.id) >= 0 && this.data.anslist() == "")
                else if (optionList.length > pdata.multimaxnum && pdata.multimaxnum > 0) {
                    pdata.showMinmassage(vxJsonLang.Answer.CheckMaxNum.replace("{0}", pdata.multimaxnum));
                    pdata.showerror(true);
                } else if (optionList.length < pdata.multiminnum && pdata.multiminnum > 0) {
                    pdata.showMinmassage(vxJsonLang.Answer.CheckMinNum.replace("{0}", pdata.multiminnum));
                    pdata.showerror(true);
                }             
                var isflag = false;
                if (optionList.length > 0 && pdata.isrequiredoption) {
                    var option = pdata.option;//选项
                         
                    for (var m = 0; m < optionList.length; m++) {
                        for (var n = 0; n < option.length; n++) {
                            if (optionList[m] == option[n].id) {                               
                                    if (option[n].anslist() == "" || option[n].anslist() == null) {
                                        pdata.showMinmassage('');
                                        pdata.showerror(true);
                                        isflag = true;
                                    }
                                }
                            }
                        }     
                };
                if (!isflag) {
                        pdata.showMinmassage('');
                        pdata.showerror(false);
                    }
                data.anslist("");
            }, 100);
            viewModel.saveAnswerlocalStorage();
            return true;
        },
        indexCheck: function (str, list) {
            var flag = true;
            for (var i = 0; i < list.length; i++) {
                if (list[i] == str) {
                    flag = false; break;
                }
            }
            return flag;

        },
        //显示消息
        messageShow: function (a, b) {
            viewModel.isShowMessage(a);
            viewModel.showMessage(b);
            setTimeout(function () { viewModel.isShowMessage(false); }, 1500);
        },
        //验证排序题
        validateClick: function () {
            var pdata = this.parentData.option;
            var value = this.data.anslist();
            var num = 0;
            var re = /^[1-9]\d*$/;
            var listValue = [];
            //正则验证正整数

            if (value != "" && value != undefined) {
                if (!re.test(value)) {
                    this.data.anslist("");
                    return false;

                }
                var optionCount = pdata.length;
                //验证选项数量
                if (value > optionCount) {
                    var error = viewModel.currentLan().SortQuestionMsg;
                    this.data.anslist("");
                    viewModel.messageShow(true, error.replace("{0}", optionCount));

                } else {

                    //验证是否存在重复数字

                    for (var i = 0; i < optionCount; i++) {
                        var value = pdata[i].anslist();
                        if (value != "" && value != undefined) {
                            //if (listValue.indexOf(value) == -1) {
                            if (viewModel.indexCheck(value, listValue)) {
                                listValue.push(pdata[i].anslist());
                                num++;
                            }
                            else {
                                var error = viewModel.currentLan().SortQuestionErro;
                                this.data.anslist("");
                                viewModel.messageShow(true, error.replace("{0}", value));
                            }
                        }
                    }

                }
            }

            //验证是否为空

            var sortList = [];
            for (var n = 0; n < pdata.length; n++) {
                if (pdata[n].anslist() != "")
                    sortList.push(pdata[n].anslist());
            }
            //必填项未答
            if (this.parentData.isrequired && sortList.length == 0)
                this.parentData.showerror(true);
            else if (sortList.length > 0 && sortList.length != pdata.length)
                this.parentData.showerror(true);
            else
                this.parentData.showerror(false);
            viewModel.saveAnswerlocalStorage();
        },
        //多选题相关题
        changeClick: function () {
            var flag = true;
            var that = this;
            setTimeout(function () {

                var checkList = that.value;

                //pageList[that.queindex].checkoption(checkList);
                var option = that.data;
                var pageList = __listData[__curQuestionnaire].PageList[__curQuestion];//当前页对象
                if (that.isrequired || checkList.length > 0) {
                    if (checkList.length == 0) {
                        pageList[that.queindex].showerror(true);
                        flag = false;
                    }
                        //判断选项是否大于题目设置的最大值
                    else if (checkList.length > that.multimaxnum && that.multimaxnum > 0) {
                        pageList[that.queindex].showMinmassage(vxJsonLang.Answer.CheckMaxNum.replace("{0}", that.multimaxnum));
                        pageList[that.queindex].showerror(true);

                        flag = false;
                    } else if (checkList.length < that.multiminnum && that.multiminnum > 0) {
                        pageList[that.queindex].showMinmassage(vxJsonLang.Answer.CheckMinNum.replace("{0}", that.multiminnum));
                        pageList[that.queindex].showerror(true);
                        flag = false;
                    }
                    else if (checkList.length >= that.multiminnum) {
                        pageList[that.queindex].showerror(false);
                        pageList[that.queindex].showMinmassage('');
                    }
                }
                if ((!that.isrequired) && checkList.length <= 0) {
                    pageList[that.queindex].showerror(false);
                    pageList[that.queindex].showMinmassage('');
                }
                var list = option.question;//相关问题
                if (list != null) {
                    var isExsit = $.inArray(that.id, checkList);//判断是否在选中值中
                    var index = 0;
                    for (var n = 0; n < checkList.length; n++) {
                        if (checkList[n] == that.id) {
                            index = 1; break;

                        }
                    }
                    if (index > 0) {

                        //加入对象中
                        var relateObject = list[0];
                        relateObject.checkoption = ko.observableArray([]);
                        relateObject.showerror = ko.observable(false);
                        relateObject.shownum = ko.observable("");
                        relateObject.showMinmassage = ko.observable("");
                        pageList.splice(that.queindex + 1, 0, relateObject);

                       

                    } else {
                        pageList.splice($.inArray(list[0], pageList), 1);
                    
                    }
                    viewModel.getPageList();

                    //设置矩阵题样式
                    viewModel.SetMatrixList();
                }
            }, 0);
            viewModel.saveAnswerlocalStorage();
            return flag;
        },



        //缓存当前页
        saveAnswerlocalStorage: function () {

            var type = this.type;                   //判断是否是矩阵题题型
            var parentData = this.parentData;       //存放当前矩阵题所有数据
            var pdata = this.pdata;

             setTimeout(function () {
                 var op = viewModel.getAnswerList();
                 var questionListAnswer = viewModel.questionListAnswer().concat();
                 var len = questionListAnswer.length;
//判断  已经加载的数据是否在当前页
                 while (len--) {
                     if (questionListAnswer[len].curquestionnaire == __curQuestionnaire && questionListAnswer[len].curpage == __curQuestion) {
                         var ishav = false;
                         for (var p in op.answer) {
                             if (p == questionListAnswer[len].questionId) {
                                 ishav =true;
                                
                             }
                         }
                         if (!ishav) {
                             viewModel.questionListAnswer().splice(len, 1);
                         }
                     }
                 }
               //判断当前页的数据是否在已经保存的数据中
                 for (var p in op.answer) {
                      var ishav = false;
                 len = questionListAnswer.length;
                    while (len--) { 
                        if (questionListAnswer[len].curquestionnaire == __curQuestionnaire && questionListAnswer[len].curpage == __curQuestion) {      
                            if (p == questionListAnswer[len].questionId) {
                                var ishav = true;                            
                          }                                          
                                            
                        }
                    }
                    if (!ishav) {
                        var question = {};
                        question.curquestionnaire = __curQuestionnaire;
                        question.curpage = __curQuestion;
                        question.questionId = p;
                        viewModel.questionListAnswer()[viewModel.questionListAnswer().length] = question;
                    }

                 }

                 //重新计算总数
                 var lengthsum = 0;
                 for (var n = 0; n < __listData.length; n++) {
                     for (var j = 0; j < __listData[n].PageList.length; j++) {
                         //var count = __listData[n].PageList[j].length;

                         var quslist = __listData[n].PageList[j];

                         for (var m = 0; m < quslist.length; m++) {
                             if (quslist[m].questiontype != 4 && quslist[m].questiontype != 6)
                             {
                                   lengthsum += 1;
                            }
                         }


                       
                     }
                 }
                 viewModel.questionSum(lengthsum)


            //记录已经答题数量
                 viewModel.questionNoanswercount(viewModel.questionListAnswer().length);
            //向下取整
                 var percent = Math.floor((viewModel.questionNoanswercount() / viewModel.questionSum()) * 100);
                 if (percent > 100) {
                     percent = 100;
                 }
                 //有逻辑题的情况下及时答完也不会是百分百
            viewModel.currentProgress(percent);


               
               
            var answer = "";
            if (JSON.stringify(op.answer) != "{}")
                answer = JSON.stringify(op.answer);
            var localStoragecontent = {
                 };
            localStoragecontent.curpage = __curQuestion;
            localStoragecontent.curpageindex = __curQuestionIndex;
            localStoragecontent.curquestionnaire = __curQuestionnaire;
            localStoragecontent.id = 0;
            localStoragecontent.personguid = __userCode;
            localStoragecontent.projectid = __projectId
            localStoragecontent.curcontent = answer;
            var contenttemp =[];
            contenttemp[0] = localStoragecontent;

            var isexist = false;
            if (answerRecordList != null) {
                for (var i = 0; i < answerRecordList.length; i++) {
                    if (answerRecordList[i].curpage == __curQuestion && answerRecordList[i].curquestionnaire == __curQuestionnaire) {
                        isexist = true;
                }
            }
                 }
            if (!isexist) {
                //localStorage.setItem(curkey, JSON.stringify(contenttemp));
                //$.cookie(curkey, JSON.stringify(contenttemp), { expires: 7, path: '/' });
                //document.cookie = curkey + "=" + escape(JSON.stringify(contenttemp)) + ";expires=7";                
                viewModel.setCookie(curkey, JSON.stringify(contenttemp));
                 }
             }, 100);


            //如果是矩阵题进行判断
             if (type == 5) {
                 if (parentData.isrequired) {
                     //存放一共有多少矩阵选项(行*列)
                     var oNum = parentData.topdepartoption.length * parentData.selectoption.length;
                     //存放矩阵选项
                     var selects = parentData.selectoption;
                     //已填答矩阵题选项统计
                     var oCount = 0;

                     for (var i = 0; i < selects.length; i++) {
                         for (var j = 0; j < selects[i].option.length; j++) {
                             var oCheck=selects[i].option[j].checkoption;
                             if (oCheck !== undefined && oCheck() !== undefined && oCheck!==null) {
                                 oCount++;
                             }
                         }
                     }

                     if (oCount === oNum) {
                         $("#matrix_error" + parentData.id).hide();
                     }

                 }
             }

        
            return true;
          
        },

        //JS操作cookies方法!
        //写cookies
        setCookie: function (name, value) {
            var Days = 30;
            var exp = new Date();
            exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
            document.cookie = name + "=" + value + ";expires=" + exp.toGMTString();
        },
        getCookie: function (name) {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg))
                return unescape(arr[2]);
            else
                return null;
        },
        //删除cookies
        delCookie: function (name) {
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = viewModel.getCookie(name);
            if (cval != null)
                document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
        },
        //下一页
        nextClick: function () {
            
            var validate = this.validateRequired();
            if (!validate) {
                //验证为通过时矩阵题滚动条重置位置
                $(".right_div2").getNiceScroll().resize();

                var isError = $(".question").find('.error-tip')[0];
                var total = isError.offsetTop - 130;
                //$(window).animate({ scrollTop: total }, 1000);
                $('html,body').animate({ scrollTop: total }, 800);
                return false;
            }

            //翻页首先隐藏矩阵题滚动条
            //Matrix.MatrixHideScrollBar();

            //viewModel.clearlocalStorage(__curQuestion);
            window.parent.scrollTo(0, 0);
            var result = this.saveNextAnswer();
            //viewModel.getAnswerRecord();
            if (result.status) {
                var op = __prevIndex;
                if (op != null && __listData.length > 0) {
                    var curQuestionnaire = op[op.length - 1].curQuestionnaire;
                    var curQuestion = op[op.length - 1].curQuestion;
                    var curQuestionIndex = op[op.length - 1].curQuestionIndex;

                    if (curQuestionnaire == __listData.length - 1 && curQuestion == __listData[curQuestionnaire].PageList.length - 1) {
                        return;

                    } else {

                        var isIndex = __listData[curQuestionnaire].PageList[curQuestion].length - 1;
                        var jumpquestionid = 0;

                        var lastq = __listData[curQuestionnaire].PageList[curQuestion][isIndex];//该页最后一道题
                        for (var t = 0; t < lastq.option.length; t++) {

                            if (lastq.option[t].jumpquestionid != "" && lastq.checkoption() == lastq.option[t].id) {
                                jumpquestionid = lastq.option[t].jumpquestionid;

                            }
                        }



                        if (jumpquestionid > 0) {

                            var total = __listData[curQuestionnaire].PageList;
                            var pageIndex = 0;
                            var jumpIndex = 0;

                            for (var p = 0; p < total.length; p++) {
                                var plist = total[p];
                                for (var a = 0; a < plist.length; a++) {
                                    if (plist[a].id == jumpquestionid) {

                                        jumpIndex = a;
                                        pageIndex = p;
                                        break;
                                    }
                                }
                            }

                            curQuestion = pageIndex;
                            __curQuestionIndex = jumpIndex;

                        } else {
                            if (curQuestion == __listData[curQuestionnaire].PageList.length - 1) {
                                curQuestionnaire++;
                                curQuestion = 0;

                            } else {
                                curQuestion++;

                            }
                            __curQuestionIndex = 0;

                        }

                        __curQuestionnaire = curQuestionnaire;
                        __curQuestion = curQuestion;

                        //依据jumpquestionid寻找题目的问卷和索引

                        __prevIndex.push({ curQuestionnaire: curQuestionnaire, curQuestion: curQuestion, curQuestionIndex: __curQuestionIndex });
                        this.getPageList();

                        //设置矩阵题样式
                        viewModel.SetMatrixList();


                    }
                }
            } else {


                viewModel.showMessage(true, result.error);

            }


        },
        //上一页
        prevClick: function () {
            if (__curQuestionnaire == 0 && __curQuestion == 0)
            {                
                window.location.href = viewModel.link() + "&tag='prevClick'";
                return;
            }
            window.parent.scrollTo(0, 0);
            var curList = { curQuestionnaire: __curQuestionnaire, curQuestion: __curQuestion };
            var op = __prevIndex;
            if (op != null) {

                op.splice($.inArray(curList, op), 1);
                var curQuestionnaire = op[op.length - 1].curQuestionnaire;
                var curQuestion = op[op.length - 1].curQuestion;
                var curQuestionIndex = op[op.length - 1].curQuestionIndex;
                __curQuestionnaire = curQuestionnaire;
                __curQuestion = curQuestion;
                __curQuestionIndex = curQuestionIndex;
            }
            this.getPageList();

            //设置矩阵题样式
            viewModel.SetMatrixList();

        },
        //提交答案,答题结束
        submitAnswer: function () {

            var jsonMessage = { "status": false, error: "" };
            var op = viewModel.getAnswerList();
            var answer = "";    
            if (JSON.stringify(op.answer) != "{}") 
            {
                eval("var curContentnew = '" + JSON.stringify(op.answer) + "';");//ie8
            }
            //else {
            var param = { projectId: __projectId, personGuid: __userCode, curQuestionnaire: __curQuestionnaire, CurPage: __curQuestion, prevIndex: JSON.stringify(__prevIndex), curPageIndex: __curQuestionIndex, curContent: curContentnew };

            var answerdata = JSON.stringify({ dto: param, clientCode: __clientCode, inputCode: viewModel.inputCode(), openCode: viewModel.isOpenCode(), answerRate: JSON.stringify(op.answerRate) });
         
            $.ajax({
                type: "POST",
                url: "/SurveyAnswer/SVSurveyAnswer/SubmitData",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                async: false,
                data: JSON.stringify({ dto: param, clientCode: __clientCode, inputCode: viewModel.inputCode(), openCode: viewModel.isOpenCode(), answerRate:  eval('('+JSON.stringify(op.answerRate)+ ')')  }),
                success: function (result) {
                    var errorMsg = "";
                    if (!result.success) {
                        if (result.status == 1) {
                            errorMsg = viewModel.currentLan().CodeErrorMsg;
                            viewModel.randCode("/SurveyAnswer/SVSurveyAnswer/ShowValidateCode?time=" + (new Date()).getTime());
                        } else if (result.status == 2)
                            errorMsg = viewModel.currentLan().ProjectCloseError;
                        else if (result.status == 3)
                            errorMsg = viewModel.currentLan().AnswerError;
                        else if (result.status == 4)
                            errorMsg = viewModel.currentLan().SiteError;
                        viewModel.messageShow(true, errorMsg);


                    } else
                        jsonMessage.status = true;
                    //localStorage.removeItem(curkey);
                    viewModel.delCookie(curkey);

                }

            });

            //}

            return jsonMessage;

        },
        //下一页面答案写入
        saveNextAnswer: function () {
            var jsonMessage = { "status": false, error: "" };

            var op = viewModel.getAnswerList();
            eval("var curContentnew = '" + JSON.stringify(op.answer) + "';");
            var param = { projectId: __projectId, personGuid: __userCode, curQuestionnaire: __curQuestionnaire, CurPage: __curQuestion, prevIndex: JSON.stringify(__prevIndex), curPageIndex: __curQuestionIndex, curContent: curContentnew };
            if (JSON.stringify(op.answer) == "{}") jsonMessage.status = true;
            else {
      
                $.ajax({
                    type: "POST",
                    url: "/SurveyAnswer/SVSurveyAnswer/AddAnswer",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false,
                    data: JSON.stringify({ dto: param, clientCode: $("#hidClientCode").val(), answerRate: JSON.stringify(op.answerRate) }),
                    success: function (result) {

                        var data = JSON.parse(result);
                        if (data.status)
                            jsonMessage.status = true;
                        else {

                            var error = parseInt(data.error);
                            var errorMsg = "";
                            switch (error) {
                                case 0: errorMsg = viewModel.currentLan().ProjectCloseError; break;
                                case 1: errorMsg = viewModel.currentLan().AnswerError; break;
                                case 2: errorMsg = viewModel.currentLan().SiteError; break;

                            }
                            jsonMessage.error = errorMsg;
                        }

                    }
                });
            }

            return jsonMessage;

        },
        //提交按钮
        submitClick: function () {

            uid = __projectId + "#@#" + __userCode + "#@#" + __language + "#@#" + __clientCode;
            var validate = this.validateRequired();
            var flag = true;
            if (!validate) {
                var isError = $(".question").find('.error-tip')[0];
                var total = isError.offsetTop - 130;
                //$(window).animate({ scrollTop: total }, 1000);
                $('html,body').animate({ scrollTop: total }, 800);
                return false;
            }
            else if (viewModel.inputCode() == "" && viewModel.isOpenCode()) {
                viewModel.messageShow(true, viewModel.currentLan().CodeIsRequired);
                flag = false;

            }
            if (flag) {
                if (viewModel.isSubmitTip()) {
                    $('body').addClass("modal-open");
                    $(".message-box-mask,.modal-backdrop").addClass("in");
                } else {
                    var result = viewModel.submitAnswer();
                    if (result.status)
                        window.location.href = "/SurveyAnswer/SVSurveyAnswer/SVEnd?uid=" + Base64.encode(uid);
                }
            }

        },
        popConfirmClick: function () {
            $('body').removeClass("modal-open");
            $(".message-box-mask,.modal-backdrop").removeClass("in");
            var result = viewModel.submitAnswer();
            if (result.status)
                window.location.href = "/SurveyAnswer/SVSurveyAnswer/SVEnd?uid=" + Base64.encode(uid);
        },
        popCancelClick: function () {
            $('body').removeClass("modal-open");
            $(".message-box-mask,.modal-backdrop").removeClass("in");
        },
        //帮助文档
        helpClick: function () {

            this.showHelp(true);
        },
        //关闭帮助文档
        closeClick: function () {

            this.showHelp(false);
        },
        //刷新验证码
        changeCodeClick: function () {

            this.randCode("/SurveyAnswer/SVSurveyAnswer/ShowValidateCode?time=" + (new Date()).getTime());

        },
        //数字验证
        numberClick: function () {
            var num = this.inputCode();
            var re = /^[0-9]*[1-9][0-9]*$/;
            if (!re.test(num))
                this.inputCode("");
        },


        //取出所有答题答案
        getAnswerList: function () {
            var list = ko.toJS(viewModel).pageList;
            var answerList = {};
            var rateList = [];
            for (var i = 0; i < list.length; i++) {
                if (list[i].questiontype == 4)
                    continue;
                var answer = list[i].checkoption;
                if (list[i].questiontype == 0 && list[i].checkoption != undefined)//单选题
                {


                    if (list[i].checkoption != "") {
                        answerList[list[i].id] = answer;
                        rateList.push({ projectId: __projectId, personGuid: __userCode, questionId: list[i].id, optionId: answer, curPage: __curQuestion, curQuestionnaire: __curQuestionnaire });

                    }

                }

                else if (list[i].questiontype == 1 && list[i].checkoption.length > 0)//多选题
                    answerList[list[i].id] = answer;
                else if (list[i].questiontype == 2)//开放题=> 1.有选项的情况,2.从题库加进来没有选项的情况
                {
                    if (answer.length > 0) {
                        var option = list[i].option;
                        //有选项的情况
                        if (option.length > 0) {
                            var oplist = [];
                            for (var m = 0; m < option.length; m++) {
                                if ($.inArray(option[m].id, answer) >= 0) {
                                    var pobject = {};
                                    var oid = option[m].id;
                                    var otext = option[m].anslist;
                                    pobject[oid] = otext;
                                    oplist.push(pobject);
                                }
                            }
                            answerList[list[i].id] = oplist;
                        }

                        else answerList[list[i].id] = answer;

                    }

                }
                else if (list[i].questiontype == 3) {

                    var oplist = [];
                    var anlist = list[i].option;
                    for (var m = 0; m < anlist.length; m++) {
                        if (anlist[m].anslist != "") {
                            var p = {};
                            p[anlist[m].id] = parseInt(anlist[m].anslist);
                            oplist.push(p);
                            answerList[list[i].id] = oplist;
                        }
                    }

                }

                else if (list[i].questiontype == 5)
                {                   
                    var answe = viewModel.getMatrixTypeAnswer(list[i].selectoption);
                    if (answe.length>0)
                    answerList[list[i].id]= answe
                }

            }

            var list = { answer: answerList };
            if (rateList.length > 0) {
                list.answerRate = rateList
            }

            return list;
        },
        getMatrixTypeAnswer: function (selectanswer) {
            if (selectanswer == null)
                return null;
            var anser = [];
//传入行集合
            for (var i = 0; i < selectanswer.length; i++)
            {
                var row = {};
                row.leftid = selectanswer[i].leftdepartmentid;
                row.column = [];
//获取单条行数据中的列答案
                var option = selectanswer[i].option;
                if (option == null)
                    continue;
                for (var j = 0; j < option.length; j++)
                {
                    var columndata = {};
                    columndata.topid = option[j].topdepartmentid;
                    columndata.checkid = option[j].checkoption;
                    //row.column[j] = columndata;
                    if (option[j].checkoption != null) {
                       row.column[j] = columndata; 
                    }
                }
                if (row.column.length>0)
                anser[i] = row;
            }
            return anser;

        },

        //设备
        getDeviceId: function () {

            var deviceId = 0;
            var sUserAgent = navigator.userAgent.toLowerCase();
            var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
            var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
            var bIsMidp = sUserAgent.match(/midp/i) == "midp";
            var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
            var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
            var bIsAndroid = sUserAgent.match(/android/i) == "android";
            var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
            var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
            if (bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
                deviceId = 2;
            } else if (bIsIpad) {
                deviceId = 0;
            } else {

                deviceId = 1;
            }

            return deviceId;

        },
        //取出答题记录
        getAnswerRecord: function () {
            var that = this;
            $.ajax({
                type: "POST",
                url: "/SurveyAnswer/SVSurveyAnswer/GetAnswerInfo",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                async: false,
                data: JSON.stringify({ projectId: __projectId, uCode: __userCode, clientCode: __clientCode }),
                success: function (result) {
                    if (result.status) {
                        if (result.answer) {
                            window.location.href = "/SurveyAnswer/SVSurveyAnswer/SVAnswered";
                        }
                        var datacook = [];
                        answerRecordList = result.info.concat();
                        if (viewModel.getCookie(curkey) != null) {
                            var isexist = false;
                            var localStoragePageJson = JSON.parse(viewModel.getCookie(curkey));
                            if (localStoragePageJson != null && localStoragePageJson.length > 0) {
                                //viewModel.bindAnswerList(localStoragePageJson);

                                for (var i = 0; i < result.info.length; i++) {
                                    if (result.info[i].curpage == localStoragePageJson[0].curpage && result.info[i].curquestionnaire == localStoragePageJson[0].curquestionnaire) {
                                        isexist = true;
                                    }
                                }
                                if (isexist) {
                                    //localStorage.removeItem(curkey);                                         
                                }
                                else {
                                    if (!(localStoragePageJson[0].curpage > 0 && result.info.length == 0)) {
                                        //result.info[result.info.length] = localStoragePageJson[0];
                                        datacook[datacook.length] = localStoragePageJson[0]
                                    } else {
                                        viewModel.delCookie(curkey);
                                    }
                                }
                            }
                        }
                        if (result.info != null && result.info != "") {

                            __prevIndex = JSON.parse(result.info[result.info.length - 1].previndex);
                            if (datacook.length > 0) {
                                __prevIndex.push({
                                    curQuestionnaire: datacook[0].curquestionnaire, curQuestion: datacook[0].curpage, curQuestionIndex: datacook[0].curpageindex
                                      });
                                result.info[result.info.length] = datacook[0];
                            }
                            __curQuestionnaire = result.info[result.info.length - 1].curquestionnaire;
                            __curQuestion = result.info[result.info.length - 1].curpage;
                            __curQuestionIndex = result.info[result.info.length - 1].curpageindex;

                            //__answerList.push(result.info);
                            if (__curQuestion == 0 && __curQuestionnaire == 0)
                                that.showPrev(true);
                            else
                                that.showPrev(true);

                            viewModel.bindAnswerList(result.info);
                        }
                        else {
                            answerRecordList = [];
                            if (datacook.length > 0)
                            {
                                viewModel.bindAnswerList(datacook);
                            }
                        }
                    }

                }
            });
        },
        //绑定答题记录
        bindAnswerList: function (answerList) {
            var answerRecord = answerList;
            var questioncount = 0;//从数据库取答案时的答题数量
            var questiinlist = [];
            if (answerRecord.length > 0) {

                for (var a = 0; a < answerRecord.length; a++) {
                    var answerPage = answerRecord[a];
                    var bindPage = __listData[answerRecord[a].curquestionnaire].PageList[answerRecord[a].curpage];

                    if (answerRecord[a].curcontent != ""&&answerRecord[a].curcontent != null) {
                        var answerValue = JSON.parse(answerRecord[a].curcontent);//
                        //计算数据库中已经答题的数量（包含缓存）
                           
                            for (var p in answerValue) {
                                if (p != null) {
                                    var question = {};
                                    question.curquestionnaire = answerPage.curquestionnaire;
                                    question.curpage = answerPage.curpage;
                                    question.questionId = p;
                                    questiinlist[questiinlist.length] = question;
                                    viewModel.questionListAnswer(questiinlist);
                                
                                }
                            }
                        for (var p = 0; p < bindPage.length; p++) {

                            if (answerValue.hasOwnProperty(bindPage[p].id)) {
                                if (bindPage[p].questiontype == 0) {

                                    bindPage[p].checkoption(answerValue[bindPage[p].id]);
                                    questioncount += 1;
                                }
                                else if (bindPage[p].questiontype == 1) {
                                    bindPage[p].checkoption(answerValue[bindPage[p].id]);
                                    questioncount += 1;
                                    //判断是否有相关问题
                                    if (bindPage[p].checkoption().length > 0) {
                                        var checkq = bindPage[p].checkoption();
                                        for (var c = 0; c < checkq.length; c++) {
                                            var option = bindPage[p].option;

                                            for (var o = 0; o < option.length; o++) {
                                                if (checkq[c] == option[o].id) {
                                                    if (option[o].question != null) {

                                                        option[o].question[0].checkoption = ko.observable("");
                                                        option[o].question[0].shownum = ko.observable(0);
                                                        bindPage.splice(p + 1, 0, option[o].question[0]);
                                                    }
                                                    //    


                                                }
                                            }

                                        }
                                    }
                                }
                                else if (bindPage[p].questiontype == 2) {
                                    //是否有选项
                                    questioncount += 1;
                                    var bindOption = bindPage[p].option;
                                    var checkId = [];
                                    if (bindOption.length > 0) {

                                        for (var ot = 0; ot < bindOption.length; ot++) {
                                            var ansValue = answerValue[bindPage[p].id];
                                            for (var v = 0; v < ansValue.length; v++) {
                                                if (answerValue[bindPage[p].id][v].hasOwnProperty(bindOption[ot].id)) {
                                                    bindOption[ot].anslist(answerValue[bindPage[p].id][v][bindOption[ot].id]);
                                                    checkId.push(bindOption[ot].id);
                                                }
                                            }
                                        }

                                    } else
                                        checkId.push(answerValue[bindPage[p].id]);

                                    bindPage[p].checkoption(checkId);
                                }
                                else if (bindPage[p].questiontype == 3) {
                                    questioncount += 1;
                                    var bindOption = bindPage[p].option;
                                    for (var bo = 0; bo < bindOption.length; bo++) {
                                        bindOption[bo].anslist(answerValue[bindPage[p].id][bo][bindOption[bo].id]);
                                    }

                                }
                                else if (bindPage[p].questiontype == 5) {
                                    var data = bindPage[p];
                                                                       
                                    var answerlist = answerValue[bindPage[p].id];
                                    questioncount += 1;
                                    var count = -1;
                                    for (var i = 0; i < data.leftdepartoption.length; i++) {
                                        if (answerlist[i] == null) continue;
                                        count++;
                                        data.selectcheckbox.push(data.leftdepartoption[i].questionid);
                                        viewModel.SetMatrixChangeOption(p, data.leftdepartoption[i]);                                    
                                     
                                        var countt = -1;
                                        for (var j = 0; j < data.topdepartoption.length; j++) {
                                            if (answerlist[i].column[j] == null) continue;
                                            countt++;
                                            var checkid = answerlist[i].column[j].checkid;
                                            data.selectoption[count].option[countt].checkoption(checkid)
                                        }                                     
                                    }

                                    //设置矩阵题样式
                                    viewModel.SetMatrixList();
                                }
                            }


                        }
                    }
                }
            }
            var percent = Math.floor((questioncount / viewModel.questionSum()) * 100);
            if (percent > 100) {
                percent = 100;
            }
            //有逻辑题的情况下及时答完也不会是百分百
            viewModel.currentProgress(percent);
      

        }
    };
    ko.applyBindings(viewModel);


    //初始化数据
    $.ajax({
        type: "POST",
        url: "/SurveyAnswer/SVSurveyAnswer/GetQuestionnaireInfo",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: false,
        data: JSON.stringify({ projectId: __projectId, clientCode: __clientCode, userCode: __userCode, deviceId: viewModel.getDeviceId(), language: __language }),
        success: function (result) {
            console.log(result.data.Questionnaire);
            if (result.success) {
                //加绑定值的属性
                var pageList = result.data.Questionnaire; 
                var projectInfo = result.data.Project;
                var that = viewModel;
                that.logImg(projectInfo.logimg);
                that.link(projectInfo.link);

                that.startText(projectInfo.starttext);
                that.isOpenLuck(projectInfo.isopenluck);
                that.isOpenCode(projectInfo.isopencode);
                that.status(projectInfo.status);
                that.qStartOne(projectInfo.qstartone);
                that.waterMark(projectInfo.watermark);
                that.helpText(projectInfo.helptext);
                that.mobileImg(projectInfo.setbackimg);
                that.submitTip(projectInfo.submitcontent);
                that.isSubmitTip(projectInfo.issubmittip);
                that.projectmethod(projectInfo.projectmethod);

                curkey += "-" + projectInfo.status;

                var sumcount = 0;//获取所有单选题 多选题 开放题
                $("body").css("background-image", "url(" + projectInfo.setbackimg + ")");
                for (var i = 0; i < pageList.length; i++) { //所有问卷

                    var pList = pageList[i].PageList;//每一个问卷

                    if (pList.length > 0) {
                        for (var j = 0; j < pList.length; j++) {
                            var num = 0;
                            for (var n = 0; n < pList[j].length; n++) {
                                var pobject = pList[j][n];//每页的对象
                                if (pobject.questiontype != 4 && pobject.questiontype != 6)//单选 多选 开放
                                    sumcount++;

                                if (pobject.questiontype == 0 || pobject.questiontype == 3)
                                    pobject.checkoption = ko.observableArray([]);//单选题
                                if (pobject.questiontype == 1) {
                                    pobject.checkoption = ko.observableArray([]);//多选题
                                    var option = pobject.option;
                                    if (option.length > 0) {
                                        for (var o = 0; o < option.length; o++) {
                                            if (option[o].question != null)
                                                option[o].question[0].showerror = ko.observable(false);
                                        }
                                    }
                                }
                                if (pobject.questiontype == 2) {
                                    pobject.checkoption = ko.observableArray([]);
                                    pobject.sortvalidate = ko.observable(false);

                                }
                                if (pobject.questiontype == 3 || pobject.questiontype == 2) {
                                    for (var m = 0; m < pobject.option.length; m++) {
                                        var option = pobject.option[m];//开放题选项
                                        if (option != null)
                                            option.anslist = ko.observable("");

                                    }
                                }

                                if (pobject.questiontype == 5) {        //矩阵题
                                    //对矩阵题数据进行处理（同其他题型处理类似，为了存储提交的选项答案）
                                    pobject.selectoption = [];
                                    Matrix.ProcessMatrixData(pobject);
                                 

                                }

                                pobject.showerror = ko.observable(false);
                                pobject.shownum = ko.observable(0);
                                pobject.showMinmassage = ko.observable("");
                                if (pobject.questionname != "" && pobject.questionname != null)
                                    pobject.questionname = pobject.questionname.replace(/&nbsp;/gi, " ");
                            }
                        }
                    }
                }
                //赋值题目总和
                that.questionSum(sumcount);
                __listData = pageList;
                viewModel.getPageList();
                viewModel.getAnswerRecord();
              
                setTimeout(function () {
                    $(".wrapper").show();
                    $('.vx-load').hide();
                }, 200);
                if (projectInfo.helptext) {
                    $(".progress-bar span").css("margin-left", "-22px");
                }
            } else {

            }

        }
    });
});





