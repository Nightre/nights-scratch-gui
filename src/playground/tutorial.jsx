import React from "react"
import Ecard from "./tutorial-img/ecard.png"
import Eblock from "./tutorial-img/eblock.png"
import Dchange from "./tutorial-img/dchange.png"
import Dself from  "./tutorial-img/dself.png"
import Dshow from  "./tutorial-img/dshow.png"

import Ccall from "./tutorial-img/ccall.png"
import Ca from "./tutorial-img/ca.png"


const Tutorial = ()=>{
    return <>
        <hr />
        <h2 style={{"textAlign":"center", "width":"100%"}}>快速教程</h2>
        <p>Nightscrach 新增了许多有用的功能,均支持编译模式</p>
        <h4>1.继承</h4>
        <p>角色可以继承于其他角色的<code>代码</code>以及<code>私有变量</code>,并且支持树状的继承. 继承于其他角色的积木是半透明颜色且于父角色同步,无法修改.</p>
        <img src={Eblock}/>
        
        <p>添加的父角色可以在右侧面板查看, 左侧按钮删除继承,右侧按钮隐藏继承积木</p>
        <img src={Ecard}/>
        <h4>2.数据结构</h4>
        <p>Nightscratch 支持三种数据 <code>列表(List)</code>, <code>字典(Map)</code>,<code>函数(见克隆体管理章节)</code>, 字典仅支持用字符串作为键. 按下下图的按钮切换积木的横竖</p>
        <img src={Dchange}/>
        <p>在变量监视器,或者积木返回框都可以查看</p>
        <img src={Dshow}/>
        <p>可以将数据结构存储到变量里,也可以<code>引用</code>一个数据, <code>自身</code>积木返回一个<code>克隆体/角色</code>的信息的字典,以及私有变量和自定义函数,可以通过这个数据来调用角色的自定义积木以及修改私有变量(详见下一章)</p>
        <img src={Dself}/>
        <h4>3.克隆体管理</h4>
        <p><code>上一个克隆体</code>返回的数据和<code>自身</code>一样,可以使用<code>调用</code>积木来调用<code>克隆体/角色</code>的自定义积木.自定义积木的名字是第一个标签的内容. 你也可以选择将克隆体的自定义积木存到变量</p>
        <img src={Ccall}/>
        <p>可以设置或读取<code>克隆体/角色</code>的私有变量</p>
        <img src={Ca} />
        <p>快去试试看吧!</p>
    </>
}

export default Tutorial