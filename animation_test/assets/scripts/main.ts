const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    onLoad () {
        
        
    }

    start(){
        var main = this.node.getComponent('AnimationComponent')
        // main.play(1,1);
        // main.playAdditive(0,1)
        // main.stop(1,4)
        // this.node.parent.on(('finished'),function(event){
        //     cc.log('-------------------animation is  over----------------')
        // })

        main.loadAnim('/AnimationAtlas/pig',0)
        this.node.parent.on(('loaded'),function(event){
            cc.log('---------'+main.customAnimation.length+'---------')
        })
    }

    // update (dt) {}
}
