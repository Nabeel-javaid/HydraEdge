import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { supabase } from '../libs';
import { auth } from '../middlewares';

export const agents = (app: Elysia) =>
    app.group('/agents', (app) =>
        app
            .use(auth) // Protect all routes in this group
            .get(
                '/:id',
                async ({ params: { id }, userId }) => {
                    const { data, error } = await supabase
                        .from('agents')
                        .select()
                        .eq('id', id);

                    if (error) return error;

                    return {
                        success: !!data[0],
                        data: data[0] ?? null,
                    };
                },
                {
                    schema: {
                        detail: {
                            description: "Retrieve user's agent by id",
                        },
                    },
                }
            )
    );