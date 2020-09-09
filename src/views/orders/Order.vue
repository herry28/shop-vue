<template>
  <div>
          <!-- 面包屑导航区域 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
        <!-- 搜索区域 -->
        <el-row>
            <el-col :span="8">
                <el-input placeholder="请输入内容">
                    <el-button slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </el-col>
        </el-row>
        <!-- 订单列表数据 -->
        <el-table :data="orderList" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="订单编号" prop="order_number"></el-table-column>
            <el-table-column label="订单价格" prop="order_price"></el-table-column>
            <el-table-column label="是否付款" prop="pay_status">
                <template slot-scope="scope">
                    <el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>
                    <el-tag type="danger" v-else>未付款</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="是否发货" prop="is_send"></el-table-column>
            <el-table-column label="下单时间" prop="create_time">
                <template slot-scope="scope">
                    {{scope.row.create_time | dateFormat}}
                </template>
            </el-table-column>
            <el-table-column label="操作">
                 <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit" @click="showAddressDialog"></el-button>
                    <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressDialog"></el-button>
                </template>
            </el-table-column>
        </el-table>
          <!-- 页码区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change='handleCurrentChange'
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                background>
            </el-pagination>     
    </el-card>

    <!-- 修改地址的对话框 -->
    <el-dialog title="修改地址"
        @close='addressDialogClosed'
        :visible.sync="addressDialogVisible"
        width="50%">
        <!-- 修改地址的表单区域 -->
       <el-form ref="addressFormRef" label-width="100px"
        :model="addressForm" :rules="addressFormRules">
            <el-form-item label="省市区县" prop="address1">
                <el-input v-model="addressForm.address1"></el-input>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
                <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
       </el-form>
        <!-- 修改地址的底部区域 -->
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible=false">取消</el-button>
            <el-button type="primary" @click="addDialogVisible=false">确认</el-button>
        </span>
    </el-dialog>
    <!-- 物流进度的对话框 -->
    <el-dialog title="物流进度"
        @close='progressDialogClosed'
        :visible.sync="progressVisible"
        width="50%">
    <!-- 时间线 -->
    <el-timeline>
        <el-timeline-item v-for="(item,index) in progressInfo" :key="index">
            {{item.context}}
        </el-timeline-item>
    </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return {
            // 请求参数对象
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10
            },
            // 订单列表数据
            orderList:[],
            // 总的订单数
            total:0,
            // 控制修改地址对话框的显示与隐藏
            addressDialogVisible:false,
            // 地址表单对象
        addressForm:{
            address1:[],
            address2:''
        },
        // 地址表单验证规则对象
        addressFormRules:{
             address1:[
                 {required:true,message:'请选择省市区县',trigger:'blur'}
             ],
             address2:[
                 {required:true,message:'请输入详细地址',trigger:'blur'}
             ]
        },
        // 控制物流对话框的显示与隐藏
        progressVisible:false,
        // 物流信息
        progressInfo:[]
        }
    },
    created(){
        this.getOrderList()
    },
    methods:{
        // 获取订单列表数据
     async  getOrderList(){
        const {data:res} = await this.$http.get('orders',{params:this.queryInfo})
        // console.log(res)
        if(res.meta.status!==200){
            return this.$message.error('获取订单列表失败')
        }
        this.total=res.data.total
        this.orderList=res.data.goods
        },
        // 监听pagesize改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize=newSize
            this.getOrderList()
        },
        // 监听页码的改变
        handleCurrentChange(newNum){
            this.queryInfo.pagenum=newNum
            this.getOrderList()
        },
        // 显示地址的对话框
        showAddressDialog(){
            this.addressDialogVisible=true
        },
        addressDialogClosed(){
            this.$refs.addressFormRef.resetFields()
        },
        // 显示物流信息对话框
        async showProgressDialog(){
            const {data:res}=await this.$http.get('/kuaidi/804909574412544580')
            if(res.meta.status!==200){
                return this.$message.error('获取物流进度失败')
            }
            this.progressInfo=res.data
            console.log(this.progressInfo)
            this.progressVisible=true
        }
        
    }
}
</script>

<style>

</style>