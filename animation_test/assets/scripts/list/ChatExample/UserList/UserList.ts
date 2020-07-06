import List from '../../CustomScroll_2'

const {ccclass, property} = cc._decorator;

@ccclass
export default class UserList extends cc.Component {

    @property(List)
    userList:List = null

    user:string[] = ['DOC.WANG','PRO.YU']
    onLoad () {
        this.userList.loadData(this.user,false)
        this.userList.setItemColor(cc.color(93,143,221,255))
        this.userList.node.opacity = 170

    }

    start () {

    }
    clickShowUsers(){
        this.userList.node.active = !this.userList.node.active
    }
}
