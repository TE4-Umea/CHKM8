const assert = require('assert');
const Server = require('../Server');

var ConfigLoader = require('../ConfigLoader');
ConfigLoader = new ConfigLoader();

var Project = new (require('../Project.js'))();
var User = new (require('../User.js'))();
var Check = new (require('../Check.js'))();

const server = new Server(ConfigLoader.load());

var test_slack_id = 'FFF000';
var test_username = 'TestUser';
var test_full_name = 'Test User';
var test_username2 = 'TestUser2';
var test_full_name2 = 'Test User2';
var test_project = 'test_project';

describe('Check config file', () => {
    it('Config file loaded or created', done => {
        assert.notEqual(server.config, undefined);
        done();
    });
});

describe('MYSQL connection and prep', () => {
    it('Test MYSQL Connection', async () => {
        var result = await server.db.query('SELECT 1');
        assert.notEqual(result, undefined);
    });

    describe('Prepare', () => {
        it('Delete if exists, then creating a test account', async () => {
            await User.delete(test_username);
            await User.delete(test_full_name2);
            var user = await User.create(
                test_username,
                'test_password',
                test_full_name
            );

            await User.create(test_username2, 'test_password', test_full_name2);

            assert.notEqual(user, undefined);
            assert.equal(user.username, test_username);

            await server.db.query(
                'UPDATE users SET slack_id = ? WHERE id = ?',
                [test_slack_id, user.id]
            );
        });
        it('Try to create user that already exists', async () => {
            var user = await User.create(
                test_username,
                'test_password',
                test_full_name
            );
            assert.equal(user, false);
        });
    });
});

describe('Account managing', () => {
    it('Generate token for user', async () => {
        var user = await User.get_from_username(test_username);
        var token = await User.generate_token(test_username);
        var user_from_token = await User.get_from_token(token);
        assert.equal(user_from_token.id, user.id);
    });

    it('Get user from username', async () => {
        var user = await User.get_from_username(test_username);
        assert.notEqual(user, undefined);
    });

    it('Get user from slack id', async () => {
        var user = await User.get_from_slack_id(test_slack_id);
        assert.notEqual(user, undefined);
    });

    it('Get user from username and password (safe)', async () => {
        var user = await User.get_from_username_and_password(
            test_username,
            'test_password'
        );
        assert.notEqual(user, undefined);
    });
});

describe('Checks', () => {
    it('Check in user (toggle, no project)', async () => {
        var user = await User.get_from_username(test_username);

        assert.equal(await Check.is_checked_in(user.id), false);
        var success = await Check.check_in(user.id, undefined, undefined, 0);

        assert.equal(await Check.is_checked_in(user.id), true);

        assert.equal(success.success, true);
    });

    it('Check out (toggle, no project)', async () => {
        var user = await User.get_from_username(test_username);
        //assert.equal(await Check.is_checked_in(user.id), true);
        var success = await Check.check_in(user.id, null, undefined, 0);
        assert.equal(success.success, true);

        assert.equal(await Check.is_checked_in(user.id), false);
    });

    it('Create project, ' + test_project, async () => {
        var user = await User.get_from_username(test_username);
        var success = await Project.create(test_project, user);
        assert.equal(success.success, true);
    });

    it(
        'Create project when project already exist ' + test_project,
        async () => {
            var user = await User.get_from_username(test_username);
            var success = await Project.create(test_project, user);
            assert.equal(success.success, false);
        }
    );

    it('Test if the user is the owner or joined', async () => {
        var user = await User.get_from_username(test_username);
        var project = await Project.get_from_name(test_project);
        var is_joined = await Project.is_joined(user.id, project.id);
        assert.equal(is_joined, true);
    });

    it('Check in (force, project name)', async () => {
        var user = await User.get_from_username(test_username);
        var success = await Check.check_in(user.id, true, test_project, 0);
        assert.equal(success.success, true);
        assert.equal(await Check.is_checked_in(user.id), true);
    });

    it('Check in (force, no project)', async () => {
        var user = await User.get_from_username(test_username);
        var success = await Check.check_in(user.id, true, null, 0);
        assert.equal(success.success, true);
        var last_checkin = await Check.get_last_check_from_user(user.id);
        assert.equal(last_checkin.check_in, true);
        assert.equal(last_checkin.project, null);
    });
});

describe('Projects', () => {
    it(
        'Check if user is not a part of project, ' + test_username2,
        async () => {
            var user2 = await User.get_from_username(test_username2);
            var project = await Project.get_from_name(test_project);
            var isJoined = await Project.is_joined(user2.id, project.id);
            assert.equal(isJoined, false);
        }
    );

    it('Add user to project, ' + test_username2, async () => {
        var user1 = await User.get_from_username(test_username);
        var user2 = await User.get_from_username(test_username2);
        var project = await Project.get_from_name(test_project);
        var added_user = await Project.add_user(user2, project.name, user1);
        assert.equal(added_user.success, true);
    });

    it('Check if user is part of project, ' + test_username2, async () => {
        var user2 = await User.get_from_username(test_username2);
        var project = await Project.get_from_name(test_project);
        var isJoined = await Project.is_joined(user2.id, project.id);
        assert.equal(isJoined, true);
    });

    it('Try to add the user again ' + test_username2, async () => {
        var user1 = await User.get_from_username(test_username);
        var user2 = await User.get_from_username(test_username2);
        var project = await Project.get_from_name(test_project);
        var added_user = await Project.add_user(user2, project.name, user1);

        assert.equal(added_user.success, false);
    });

    it('Remove user from project (self)', async () => {
        var user1 = await User.get_from_username(test_username);
        var user2 = await User.get_from_username(test_username2);
        var project = await Project.get_from_name(test_project);

        var result = await Project.remove_user(user2, project.id, user2);
        assert.equal(result.success, true);

        await Project.add_user(user2, project.name, user1);
        // Add back user to project for further testing
    });

    it('Remove user from project (by third party)', async () => {
        var user1 = await User.get_from_username(test_username);
        var user2 = await User.get_from_username(test_username2);
        var project = await Project.get_from_name(test_project);

        var result = await Project.remove_user(user2, project.id, user1);

        assert.equal(result.success, true);

        // Add back user to project for further testing
        await Project.add_user(user2, project.id, user1);
    });

    it('Get project data and members', async () => {
        var project = await Project.get_from_name(test_project);
        var project_data = await Project.get_data(project.id);
        assert.notEqual(project_data, undefined);
        assert.notEqual(project_data.project.members[0].name, undefined);
    });
    
});


describe('Delete user and cleanup', () => {
    it('Delete project', async () => {
        var user = await User.get_from_username(test_username);
        var success = await Project.delete(test_project, user.id);
        assert.equal(success.success, true);
        project = await Project.get_from_name(test_project);
        assert.equal(project, undefined);
    });

    it('Clean up', async () => {
        var user = await User.get_from_username(test_username);
        var user2 = await User.get_from_username(test_username2);
        await server.db.query('DELETE FROM checks WHERE user = ?', user.id);
        await server.db.query('DELETE FROM projects WHERE owner = ?', user.id);
        await server.db.query('DELETE FROM checks WHERE user = ?', user2.id);
        await server.db.query('DELETE FROM projects WHERE owner = ?', user2.id);
        await server.db.query('DELETE FROM joints WHERE user = ?', user.id);
        await server.db.query('DELETE FROM joints WHERE user = ?', user2.id);
    });

    it('Delete users', async () => {
        await User.delete(test_username);
        await User.delete(test_username2);
        user = await User.get_from_username(test_username);
        assert.equal(user, undefined);
        /** Shut down server and finnish test */
        server.server.close();
    });
});
