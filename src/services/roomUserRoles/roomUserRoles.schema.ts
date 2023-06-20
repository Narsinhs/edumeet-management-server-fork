// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { roleSchema } from '../roles/roles.schema';

// Main data model schema
export const roomUserRoleSchema = Type.Object(
	{
		id: Type.Number(),
		roomId: Type.Number(),
		userId: Type.Number(),
		roleId: Type.Number(),
		role: Type.Ref(roleSchema),
	},
	{ $id: 'RoomUserRole', additionalProperties: false }
);
export type RoomUserRole = Static<typeof roomUserRoleSchema>
export const roomUserRoleResolver = resolve<RoomUserRole, HookContext>({
	role: virtual(async (roomUserRole, context) => {
		return context.app.service('roles').get(roomUserRole.roleId);
	}),
});

export const roomUserRoleExternalResolver = resolve<RoomUserRole, HookContext>({});

// Schema for creating new entries
export const roomUserRoleDataSchema = Type.Pick(roomUserRoleSchema, [ 'roomId', 'userId', 'roleId' ], {
	$id: 'RoomUserRoleData'
});
export type RoomUserRoleData = Static<typeof roomUserRoleDataSchema>
export const roomUserRoleDataValidator = getValidator(roomUserRoleDataSchema, dataValidator);
export const roomUserRoleDataResolver = resolve<RoomUserRole, HookContext>({});

// Schema for updating existing entries
export const roomUserRolePatchSchema = Type.Partial(roomUserRoleDataSchema, {
	$id: 'RoomUserRolePatch'
});
export type RoomUserRolePatch = Static<typeof roomUserRolePatchSchema>
export const roomUserRolePatchValidator = getValidator(roomUserRolePatchSchema, dataValidator);
export const roomUserRolePatchResolver = resolve<RoomUserRole, HookContext>({});

// Schema for allowed query properties
export const roomUserRoleQueryProperties = Type.Pick(roomUserRoleSchema, [ 'id', 'roomId', 'userId', 'roleId' ]);
export const roomUserRoleQuerySchema = Type.Intersect(
	[
		querySyntax(roomUserRoleQueryProperties),
		// Add additional query properties here
		Type.Object({}, { additionalProperties: false })
	],
	{ additionalProperties: false }
);
export type RoomUserRoleQuery = Static<typeof roomUserRoleQuerySchema>
export const roomUserRoleQueryValidator = getValidator(roomUserRoleQuerySchema, queryValidator);
export const roomUserRoleQueryResolver = resolve<RoomUserRoleQuery, HookContext>({
	// TODO: make sure the user owns the room or is a tenant admin
	roomId: async (value, query, context) => {
		if (typeof value === 'number' && context.params.user) {
			const existingRoom = await context.app.service('rooms').get(value);

			// Make sure the room belongs to the same tenant as the user
			if (!existingRoom || existingRoom.tenantId !== context.params.user.tenantId)
				throw new Error('roomId is invalid');
		}

		return value;
	},
	userId: async (value, query, context) => {
		if (typeof value === 'number' && context.params.user) {
			const existingUser = await context.app.service('users').get(value);

			// Make sure the user belongs to the same tenant as the user
			if (!existingUser || existingUser.tenantId !== context.params.user.tenantId)
				throw new Error('userId is invalid');
		}

		return value;
	},
	roleId: async (value, query, context) => {
		if (typeof value === 'number' && context.params.user) {
			const existingRole = await context.app.service('roles').get(value);

			// Make sure the role belongs to the same tenant as the user
			if (!existingRole || existingRole.tenantId !== context.params.user.tenantId)
				throw new Error('roleId is invalid');
		}

		return value;
	}
});
