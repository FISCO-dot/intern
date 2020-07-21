const {ccclass, property,executionOrder} = cc._decorator;

@ccclass
@executionOrder(-4000)
export default class NewClass extends cc.Component {


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    onLoad () {
        this.resetSize(this.node);
        cc.find('Canvas/MessageList').getComponent("CustomScroll_2").viewWidth = this.node.width
        cc.find('Canvas/MessageList').getComponent("CustomScroll_2").viewHeight = this.node.height
    }
    resetSize(cav) {
        let frameSize = cc.view.getFrameSize();
        let designSize = cc.view.getDesignResolutionSize();
        if (frameSize.width / frameSize.height > designSize.width / designSize.height) {
            cav.width = designSize.height * frameSize.width / frameSize.height;
            cav.height = designSize.height;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        } else {
            cav.width = designSize.width;
            cav.height = designSize.width * frameSize.height / frameSize.width;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        }
        this.fitScreen(cav, designSize);
    }
    fitScreen(canvasnode, designSize) {
        let scaleW = canvasnode.width / designSize.width;
        let scaleH = canvasnode.height / designSize.height;

        let bgNode = canvasnode.getChildByName('Background');
        let bgScale = canvasnode.height / bgNode.height;
        bgNode.width *= bgScale;
        bgNode.height *= bgScale;
        if (scaleW > scaleH) {
            bgScale = canvasnode.width / bgNode.width;
            bgNode.width *= bgScale;
            bgNode.height *= bgScale;
        }
    }
    // update (dt) {}
}
