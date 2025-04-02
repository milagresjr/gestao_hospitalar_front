"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    return (props: any) => {
        const { token } = useAuthStore();
        const router = useRouter();
        useEffect(() => {
        if(!token) {
            router.push('/signin');
        }
        }, [token,router]);

        if(!token) {
            return null;
        }

        return <WrappedComponent {...props} />
    };
};