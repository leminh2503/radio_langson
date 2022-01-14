export function checkViewUser(permissions) {
    return permissions.split(",").includes('view_user');
}

export function checkCEDUser(permissions) {
    return permissions.split(",").includes('create_user', 'edit_user', 'delete_user');
}