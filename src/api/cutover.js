import request from '@/utils/request'
// 登录
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/vue-element-admin/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}

// 1.新增割接任务信息
export function addCutover(data) {
  return request({
    url: '/task',
    method: 'post',
    // data: data
    data
  })
}
// 2.查询割接任务信息详细
export function getCutover(id) {
  return request({
    url: '/task/' + id,
    method: 'get'
  })
}

// 3.修改任务
export function updateCutover(data) {
  return request({
    url: '/task',
    method: 'put',
    data: data
  })
}

// 4.查询任务列表
export function listCutover(query) {
  return request({
    url: '/list',
    method: 'get',
    params: query
  })
}

// 5.发送注册音频

// 6.发起审核
export function sendTask(data) {
  return request({
    url: '/sendTask',
    method: 'get',
    params: data
  })
}

// 7.生成数据 7和8暂时先按照了标注系统的下载写的，后续要改再商量？
export function download(data) {
  return request({
    url: '/app/task/download/annotationReport',
    method: 'get',
    params: data
  })
}

// 8.下载 utils中 下载

// 删除割接辅助
export function delCutover(id) {
  return request({
    url: '/task/' + id,
    method: 'delete'
  })
}

// 导出割接辅助
export function exportCutover(data) {
  return request({
    url: '/download',
    method: 'get',
    params: data
  })
}

// 下载割接辅助
export function downloadCutover(data) {
  return request({
    url: '/download',
    method: 'get',
    params: data
  })
}

// 下载割接辅助
export function downloadgejie(data) {
  return request({
    url: '/download',
    method: 'get',
    params: data
  })
}
