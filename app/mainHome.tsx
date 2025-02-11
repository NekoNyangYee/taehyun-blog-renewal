"use client";

import { addUserToProfileTable } from "@components/lib/loginUtils";
import { supabase } from "@components/lib/supabaseClient";
import { useEffect } from "react";

export default function MainHome() {
    useEffect(() => {
        const addUser = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error) {
                console.error("세션 가져오기 에러:", error);
                return;
            }

            if (data.session) {
                const userSessionData = {
                    id: data.session.user.id,
                    nickname: data.session.user.user_metadata.full_name || "",
                    profile: data.session.user.user_metadata.avatar_url || "",
                    email: data.session.user.email,
                }
                await addUserToProfileTable(userSessionData);
                console.log("유저 추가 완료");
            }

        }

        addUser();
    }, []);

    return (
        <>
            <p>eeeeeee</p>
        </>
    );
}
