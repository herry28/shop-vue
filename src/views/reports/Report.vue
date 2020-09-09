<template>
  <div>
             <!-- 面包屑导航区域 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>数据统计</el-breadcrumb-item>
        <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 2.为echarts准备一个具备大小的dom -->
        <div id="main" style="width:600px;height:400px"></div>
    </el-card>
  </div>
</template>

<script>
//1. 导入echarts
import echarts from 'echarts'
import _ from 'lodash'
export default {
    data(){
        return {
            // 需要合并的数据
            option:{
                title:{
                    text:'用户来源'
                },
                tooltip:{
                    trigger:'axis',
                    axisPointer:{
                        type:'cross',
                        label:{
                            backgroundColor:'#e9eef3'
                        }
                    }
                },
                grid:{
                    left:'3%',
                    right:'4%',
                    bottom:'3%',
                    containLabel:true
                },
                xAxis:[
                    {boundaryGap:false}
                ],
                yAxis:[
                    {type:'value'}
                ]
            }
        }
    },
    created(){

    },
    // 此时页面上的元素已经被渲染完毕
    async mounted(){
        // 3.基于dom，初始化echarts实例
        var myChart=echarts.init(document.getElementById('main'))
        const {data:res}= await this.$http.get('reports/type/1')
        if(res.meta.status!==200){
            return this.$message.error('获取报表数据失败')
        }
        // 4.准备数据和配置项
       const result=_.merge(res.data,this.option) //合并对象
        // 5.展示数据
        myChart.setOption(res.data)
    }
}
</script>

<style>

</style>