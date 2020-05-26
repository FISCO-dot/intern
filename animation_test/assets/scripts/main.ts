import {eventCenter} from './AnimationComponent'
const {ccclass} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    
    onLoad () {
        
        
    }

    start(){
        var main = this.node.getComponent('AnimationComponent')
        main.play(1,1);
        main.playAdditive(0,1)
        eventCenter.on('finished',()=>{
            cc.log('finsished receive')
        })
        
        // main.stop(1,4)
        // this.node.parent.on(('finished'),function(event){
        //     cc.log('-------------------animation is  over----------------')
        // })
        
        // main.loadAnim('/AnimationAtlas/pig',0,1,()=>{
        //     cc.log('---------111----------'+main.customAnimation.length)
        // })
        
        // this.node.parent.on(('loaded'),function(event){
        //     cc.log('---------'+main.customAnimation.length+'---------')
        // })
    }

    // update (dt) {}
}
