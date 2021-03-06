
const {ccclass, property,executionOrder} = cc._decorator;
import { eventCenter } from '../../CustomScroll_2'
import * as CopyMessage from '../Global/global'
import ListItem from '../../ListItem';
let copyMessage = new CopyMessage.default
@ccclass
export default class AddList extends cc.Component {

    data: any[] = []
    menuTemplate : string [] 

    onLoad () {
        this.node.addComponent(cc.BlockInputEvents)
        let dropList = this.node.getComponent('CustomScroll_2')
        if(this.node.parent.name == "InputBox"){
            this.menuTemplate = ['copy','paste']
            dropList.viewWidth = 80           
            dropList.viewHeight = 50
            dropList.fontSize = 20
            dropList.width = 60
            dropList.height = 25
            dropList.itemNumY = 2
            dropList.loadData(this.menuTemplate)
            dropList.setItemColor(cc.color(144,169,214))
            eventCenter.on('pickDropList',(node)=>{
                let event = node[0].getComponentInChildren(cc.RichText).string
                
                switch (event) {
                    case 'copy':
                        copyMessage.copyMessage = this.node.parent.getComponent(cc.RichText).string
                        break;
                    case 'paste':
                        if(copyMessage.copyMessage == undefined) break;
                        else {
                            this.node.parent.getComponent(cc.RichText).string = copyMessage.copyMessage
                            cc.find('Canvas/InputBox').getComponent('InputBox').input = copyMessage.copyMessage
                        }
                    default:
                        break;
                }
                node[0].parent.parent.parent.removeFromParent()
            },this.node)
        }
        else if(this.node.parent.parent.parent.parent.name == "MessageList"){
            let parentList = this.node.parent.parent.parent.parent.getComponent('CustomScroll_2')
            if(this.node.parent.getComponentInChildren(cc.RichText).string != ''){
                this.menuTemplate = ['copy','paste','delete','...']
            }
            else{
                this.menuTemplate = ['copy','paste','delete','add']
            }
            dropList.width = 60
            dropList.height = 25
            dropList.fontSize = 20
            dropList.viewWidth = 80 
            dropList.itemNumY = this.menuTemplate.length
            dropList.viewHeight = dropList.height * dropList.itemNumY
            dropList.loadData(this.menuTemplate)
            dropList.setItemColor(cc.color(144,169,214))
            eventCenter.on('pickDropList',(node)=>{
                let event = node[0].getComponentInChildren(cc.RichText).string
                let pickNode = parentList.returnPick()[0]
                switch (event) {
                    case 'delete':
                        parentList.deleteItem((delnode)=>{
                            this.showDelMsg(parentList,delnode)
                        })
                        break;
                    case 'copy':
                        if(pickNode.getComponentInChildren(cc.RichText).string != '')
                            copyMessage.copyMessage = parentList.returnPick()[0].getComponentInChildren(cc.RichText).string
                        else copyMessage.copyMessage = parentList.returnPick()[0].getChildByName('imgMsg').getComponent(cc.Sprite).spriteFrame
                        break;
                    case 'paste':
                        if(copyMessage.copyMessage == (undefined)) break;
                        else {
                            let bia = pickNode.height
                            if(typeof(copyMessage.copyMessage) == 'string'){
                                try{
                                    pickNode.getChildByName('imgMsg').getComponent(cc.Sprite).spriteFrame = null
                                }catch{}
                                finally{
                                    pickNode.getComponentInChildren(cc.RichText).string = copyMessage.copyMessage                                    
                                    parentList.ChangeDataByIndex(Number(parentList.returnPick()[0].name),copyMessage.copyMessage)
                                    pickNode.getComponent('ListItem').itemOnLoad()
                                    cc.log('fontsize = ',pickNode.getComponentInChildren(cc.RichText).fontSize)
                                    this.adjustItemPos(parentList,parentList.returnPick()[0])
                                }
                            }
                            else {
                                try{
                                    pickNode.getChildByName('imgMsg').getComponent(cc.Sprite).spriteFrame = copyMessage.copyMessage
                                }catch{}
                                finally{
                                    pickNode.getComponentInChildren(cc.RichText).string = ''
                                    parentList.ChangeDataByIndex(Number(parentList.returnPick()[0].name),copyMessage.copyMessage)
                                    pickNode.getComponent('ListItem').itemOnLoad()
                                    this.adjustItemPos(parentList,parentList.returnPick()[0])
                                }
                            }
                            pickNode.children[0].y += (pickNode.height - bia)/2  //调整头像位置
                        }
                        break;
                    case '...':
                        break;
                    case 'add':  //将图片添加到图片列表
                        cc.find('Canvas/InputBox/ToggleContainer/AddPic/PicList').getComponent('CustomScroll_2').addData(pickNode.getChildByName('imgMsg').getComponent(cc.Sprite).spriteFrame)
                        break;
                    default:
                        break;
                }
                eventCenter.emit(`select${parentList.node.name}`,node[0].parent.parent.parent.parent)
                this.node.removeFromParent()
            },this.node)
            
        }

    }
    showDelMsg(list,node){
        let delMsg = cc.instantiate(list.prefabSet[2])
        let labelNode = new cc.Node('label')
        let label = labelNode.addComponent(cc.RichText)
        delMsg.addChild(labelNode)
        label.string = `you have delete a message`
        delMsg.setPosition(0,node.y)
        delMsg.name = node.name
        let item = list.getItem()
        item[Number(node.name)] = delMsg
        list.addData(delMsg.getComponentInChildren(cc.RichText).string,Number(delMsg.name))
        list.content.addChild(delMsg)
        delMsg.addComponent('ListItem').setFontSize(10)
        delMsg.getComponent('ListItem').itemOnLoad()
        delMsg.off(cc.Node.EventType.TOUCH_END)
        this.adjustItemPos(list,node)
        list._deleteList = []
    }
    adjustItemPos(list,node){
        let itemPos = list.getItemposition()
        let item = list.getItem()
        for(var i = Number(node.name);i < list.itemNumY;i++){
            if(i == 0) itemPos[String(i)].y = list.content.height/2-item['0'].height-list.topWidget
            else {
                itemPos[String(i)].y = itemPos[String(i-1)].y-item[i].height-list.interval
            }
        }
        list.updateView()
    }



    // update (dt) {}
}

