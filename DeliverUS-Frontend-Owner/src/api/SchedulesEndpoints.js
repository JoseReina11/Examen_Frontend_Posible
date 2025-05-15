import { get, post, put, destroy } from './helpers/ApiRequestsHelper'


function getSchedules (restaurantId) {
  return get(`restaurants/${restaurantId}/schedules`)
}

function create (restaurantId, data) {
  return post(`/restaurants/${restaurantId}/schedules`, data)
}

function update (restaurantId, scheduleId, data) {
  return put(`/restaurants/${restaurantId}/schedules/${scheduleId}`, data)
}

function remove (restaurantId, scheduleId) {
  return destroy(`/restaurants/${restaurantId}/schedules/${scheduleId}`)
}

export { getSchedules, create, update, remove }