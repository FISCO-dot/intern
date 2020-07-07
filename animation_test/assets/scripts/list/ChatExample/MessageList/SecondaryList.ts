
const {ccclass, property,executionOrder} = cc._decorator;

@ccclass
export default class AddList extends cc.Component {

    data: any[] = []
    onLoad () {
        cc.log('jinlaile')
        this.data = ['copy','paste','delete','quote','favor']
        this.node.addComponent(cc.BlockInputEvents)
        let dropList = this.node.getComponent('CustomScroll_2')

        dropList.viewWidth = 80           
        dropList.viewHeight = 100
        dropList.fontSize = 20
        dropList.width = 80
        dropList.height = 20
        dropList.itemNumY = 5
        dropList.loadData(this.data)
        this.node.setPosition(20,-150)
        
    }




    // update (dt) {}
}
