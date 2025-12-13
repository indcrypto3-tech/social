
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

interface PostPublishedEmailProps {
    postContent: string;
    platform: string;
    postLink: string; // permalink
}

export const PostPublishedEmail = ({
    postContent,
    platform,
    postLink,
}: PostPublishedEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your post is live!</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Post Published Successfully</Heading>
                    <Text style={text}>
                        Your post has been successfully published to <strong>{platform}</strong>.
                    </Text>
                    <Text style={text}>
                        <strong>Content Snippet:</strong> {postContent.substring(0, 100)}...
                    </Text>
                    <Link href={postLink} style={btn}>
                        View Live Post
                    </Link>
                    <Text style={footer}>
                        Social Scheduler Notifier
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

// Styles (reusing similar styles)
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
    color: "#28a745",
    textAlign: "center" as const,
};

const text = {
    fontSize: "16px",
    lineHeight: "26px",
    margin: "16px 0",
};

const btn = {
    backgroundColor: "#28a745",
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
