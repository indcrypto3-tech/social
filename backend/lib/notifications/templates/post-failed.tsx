
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Text,
} from "@react-email/components";
import * as React from "react";

interface PostFailedEmailProps {
    postContent: string;
    error: string;
    postLink: string;
}

export const PostFailedEmail = ({
    postContent,
    error,
    postLink,
}: PostFailedEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your post failed to publish</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Post Failed to Publish</Heading>
                    <Text style={text}>
                        We encountered an error while trying to publish your post.
                    </Text>
                    <Text style={text}>
                        <strong>Content Snippet:</strong> {postContent.substring(0, 100)}...
                    </Text>
                    <Text style={errorCode}>
                        <strong>Error:</strong> {error}
                    </Text>
                    <Link href={postLink} style={btn}>
                        View Post to Retry
                    </Link>
                    <Text style={footer}>
                        Autopostr Notifier
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: "#ffffff",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    width: "560px",
};

const h1 = {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "40px 0",
    padding: "0",
    textAlign: "center" as const,
};

const text = {
    fontSize: "16px",
    lineHeight: "26px",
    margin: "16px 0",
};

const errorCode = {
    ...text,
    color: "#ff0000",
    backgroundColor: "#fff0f0",
    padding: "10px",
    borderRadius: "4px",
}

const btn = {
    backgroundColor: "#007bff",
    borderRadius: "3px",
    color: "#fff",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px",
    margin: "20px 0",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
};
