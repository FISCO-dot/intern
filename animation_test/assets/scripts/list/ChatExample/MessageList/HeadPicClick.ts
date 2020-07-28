const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    start () {
        this.node.addComponent(cc.BlockInputEvents)
        this.node.on(cc.Node.EventType.TOUCH_END,()=>{
            let alertNode = new cc.Node('alert')
            alertNode.addChild(this.createSingleColoredBg())
            let headPic = new cc.Node('headPic')
            alertNode.addChild(headPic)
            headPic.addComponent(cc.Sprite).spriteFrame = this.node.getComponent(cc.Sprite).spriteFrame
            cc.find('Canvas').addChild(alertNode)
            headPic.width = cc.winSize.width/2
            headPic.height  = headPic.width
            alertNode.setPosition(0,0)
            this.node.color = cc.color(255,255,255)
        })
    }
    createSingleColoredBg(){
        let texture = new cc.Texture2D;
        let spriteFrame = new cc.SpriteFrame;
        texture.initWithData(new DataView(new ArrayBuffer(8)), cc.Texture2D.PixelFormat.RGB888, 1, 1);
        spriteFrame.setTexture(texture);
        spriteFrame.setRect(cc.rect(0, 0, cc.winSize.width * 20, cc.winSize.width * 20));
        //初始化模态
        let node = new cc.Node;
        node.name = "modelbg";
        node.opacity = 150;
        node.setPosition(cc.v2());
        node.setContentSize(cc.winSize);
        node.addComponent(cc.Sprite).spriteFrame = spriteFrame;
        node.on("touchend", e => { e.stopPropagation(); });// 不可点击穿透
        node.on(cc.Node.EventType.TOUCH_END,()=>{
            node.parent.destroy()
        })
        return node
    }

}
