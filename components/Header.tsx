"use client";

import { supabase } from "@components/lib/supabaseClient";
import { useSessionStore } from "@components/store/sessionStore";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

export default function Header() {
    const { session, addSession } = useSessionStore();

    useEffect(() => {
        const fetchSession = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (data.session) {
                addSession(data.session);
            } else {
                addSession(null);
            }

            if (error) {
                console.log(error);
            }
        };

        fetchSession();
    }, []);

    const logoutHandler = async () => {
        alert("로그아웃 되었습니다.");
        await supabase.auth.signOut();
        addSession(null);
        console.log("Session after logout:", session);
    };

    return (
        <div className="flex justify-between p-container border border-b-containerColor w-full">
            <p>ss</p>
            {session ? (
                <div>
                    <Image
                        src={session.user?.user_metadata.avatar_url || ""}
                        width={32}
                        height={32}
                        alt="profile image"
                    />
                    <Button onClick={logoutHandler} className="border border-logoutColor p-button">
                        logout
                    </Button>
                </div>
            ) : (
                <>
                    <Link
                        href="/login"
                        className="border border-containerColor p-button"
                        onClick={() => console.log(session)}
                    >
                        로그인
                    </Link>
                </>
            )}
        </div>
    );
}