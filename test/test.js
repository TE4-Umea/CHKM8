const assert = require('assert');
const Server = require('../Server');

var ConfigLoader = require('../ConfigLoader');
ConfigLoader = new ConfigLoader();

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
            await server.User.delete(test_username);
            await server.User.delete(test_full_name2);
            var user = await server.User.create(
                test_username,
                'test_password',
                test_full_name
            );
            var user2 = await server.User.create(
                test_username2,
                'test_password',
                test_full_name2
            );

            assert.equal(user.success, true);
            assert.notEqual(user.user, undefined);
            assert.equal(user.user.username, test_username);

            await server.db.query(
                'UPDATE users SET slack_id = ? WHERE id = ?',
                [test_slack_id, user.user.id]
            );
        });
        it('Try to create user that already exists', async () => {
            var user = await server.User.create(
                test_username,
                'test_password',
                test_full_name
            );
            assert.equal(user.success, false);
        });
    });
});

describe('Account managing', () => {
    it('Generate token for user', async () => {
        var user = await server.User.get_from_username(test_username);
        var token = await server.User.generate_token(test_username);
        var user_from_token = await server.User.get_from_token(token);
        assert.equal(user_from_token.id, user.id);
    });

    it('Get user from username', async () => {
        var user = await server.User.get_from_username(test_username);
        assert.notEqual(user, undefined);
    });

    it('Get user from slack id', async () => {
        var user = await server.User.get_from_slack_id(test_slack_id);
        assert.notEqual(user, undefined);
    });

    it('Get user from username and password (safe)', async () => {
        var user = await server.User.get_from_username_and_password(
            test_username,
            'test_password'
        );
        assert.notEqual(user, undefined);
    });
});

describe('§', () => {
    it('Check in user (toggle, no project)', async () => {
        var user = await server.User.get_from_username(test_username);
        assert.equal(await server.Check.is_checked_in(user.id), false);
        var success = await server.Check.check_in(
            user.id,
            undefined,
            undefined,
            'Test'
        );

        assert.equal(await server.Check.is_checked_in(user.id), true);
        assert.equal(success.success, true);
    });

    it('Check out (toggle, no project)', async () => {
        var user = await server.User.get_from_username(test_username);
        assert.equal(await server.Check.is_checked_in(user.id), true);
        var success = await server.Check.check_in(
            user.id,
            undefined,
            undefined,
            'Test'
        );

        assert.equal(success.success, true);
        assert.equal(await server.Check.is_checked_in(user.id), false);
    });

    it('Create project, ' + test_project, async () => {
        var user = await server.User.get_from_username(test_username);
        var success = await server.Project.create(test_project, user);
        assert.equal(success.success, true);
    });

    it(
        'Create project when project already exist ' + test_project,
        async () => {
            var user = await server.User.get_from_username(test_username);
            var success = await server.Project.create(test_project, user);
            assert.equal(success.success, false);
        }
    );

    it('Test if the user is the owner or joined', async () => {
        var user = await server.User.get_from_username(test_username);
        var project = await server.Project.get_from_name(test_project);
        var is_joined = await server.Project.is_joined(user.id, project.id);
        assert.equal(is_joined, true);
    });

    it('Check in (force, project name)', async () => {
        var user = await server.User.get_from_username(test_username);
        var success = await server.Check.check_in(
            user.id,
            true,
            test_project,
            'Test'
        );
        assert.equal(success.success, true);
        assert.equal(await server.Check.is_checked_in(user.id), true);
    });

    it('Check in (force, no project)', async () => {
        var user = await server.User.get_from_username(test_username);
        var success = await server.Check.check_in(user.id, true, null, 'Test');
        assert.equal(success.success, true);
        var last_checkin = await server.Check.get_last_check(user.id);
        assert.equal(last_checkin.check_in, true);
        assert.equal(last_checkin.project, '');
    });
});

describe('Projects', () => {
    it(
        'Check if user is not a part of project, ' + test_username2,
        async () => {
            var user2 = await server.User.get_from_username(test_username2);
            var project = await server.Project.get_from_name(test_project);
            var isJoined = await server.Project.is_joined(user2.id, project.id);
            assert.equal(isJoined, false);
        }
    );

    it('Add user to project, ' + test_username2, async () => {
        var user1 = await server.User.get_from_username(test_username);
        var user2 = await server.User.get_from_username(test_username2);
        var project = await server.Project.get_from_name(test_project);
        var added_user = await server.Project.add_user(
            user2,
            project.name,
            user1
        );
        assert.equal(added_user.success, true);
    });

    it('Check if user is part of project, ' + test_username2, async () => {
        var user2 = await server.User.get_from_username(test_username2);
        var project = await server.Project.get_from_name(test_project);
        var isJoined = await server.Project.is_joined(user2.id, project.id);
        assert.equal(isJoined, true);
    });

    it('Try to add the user again ' + test_username2, async () => {
        var user1 = await server.User.get_from_username(test_username);
        var user2 = await server.User.get_from_username(test_username2);
        var project = await server.Project.get_from_name(test_project);
        var added_user = await server.Project.add_user(
            user2,
            project.id,
            user1
        );
        assert.equal(added_user.success, false);
    });

    it('Remove user from project (self)', async () => {
        var user1 = await server.User.get_from_username(test_username);
        var user2 = await server.User.get_from_username(test_username2);
        var project = await server.Project.get_from_name(test_project);

        var result = await server.Project.remove_user(user2, project.id, user2);
        assert.equal(result.success, true);
        // Add back user to project for further testing
        await server.Project.add_user(user2, project.id, user1);
    });

    it('Remove user from project (by third party)', async () => {
        var user1 = await server.User.get_from_username(test_username);
        var user2 = await server.User.get_from_username(test_username2);
        var project = await server.Project.get_from_name(test_project);

        var result = await server.Project.remove_user(user2, project.id, user1);

        console.log("FUCKING REE", result)
        assert.equal(result.success, true);

        // Add back user to project for further testing
        await server.Project.add_user(user2, project.id, user1);
    });

    it('Get project data and members', async () => {
        var project = await server.Project.get_from_name(test_project);
        var project_data = await server.Project.get_data(project.id);
        assert.notEqual(project_data, undefined);
        assert.notEqual(project_data.project.members[0].name, undefined);
    });
});

describe('Delete user and cleanup', () => {
    it('Delete project', async () => {
        var user = await server.User.get_from_username(test_username);
        var success = await server.Project.delete(test_project, user.id);
        assert.equal(success.success, true);
        project = await server.Project.get_from_name(test_project);
        assert.equal(project, undefined);
    });

    it('Clean up', async () => {
        var user = await server.User.get_from_username(test_username);
        var user2 = await server.User.get_from_username(test_username2);
        await server.db.query('DELETE FROM checks WHERE user = ?', user.id);
        await server.db.query('DELETE FROM projects WHERE owner = ?', user.id);
        await server.db.query('DELETE FROM checks WHERE user = ?', user2.id);
        await server.db.query('DELETE FROM projects WHERE owner = ?', user2.id);
        await server.db.query('DELETE FROM joints WHERE user = ?', user.id);
        await server.db.query('DELETE FROM joints WHERE user = ?', user2.id);
    });

    it('Delete users', async () => {
        await server.User.delete(test_username);
        await server.User.delete(test_username2);
        user = await server.User.get_from_username(test_username);
        assert.equal(user, undefined);
        /** Shut down server and finnish test */
        server.server.close();
    });
});
