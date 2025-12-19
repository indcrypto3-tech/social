
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Row,
    Column
} from "@react-email/components";
import * as React from "react";

interface WeeklyDigestEmailProps {
    stats: {
        postsPublished: number;
        engagement: number;
        followersGained: number;
    };
    startDate: string;
    endDate: string;
}

export const WeeklyDigestEmail = ({
    stats,
    startDate,
    endDate
}: WeeklyDigestEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your Weekly Performance Summary</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>Weekly Digest</Heading>
                    <Text style={subtitle}>
                        {startDate} - {endDate}
                    </Text>

                    <Section style={statsContainer}>
                        <Row>
                            <Column style={statBox}>
                                <Text style={statNumber}>{stats.postsPublished}</Text>
                                <Text style={statLabel}>Posts</Text>
                            </Column>
                            <Column style={statBox}>
                                <Text style={statNumber}>{stats.engagement}</Text>
                                <Text style={statLabel}>Engagement</Text>
                            </Column>
                            <Column style={statBox}>
                                <Text style={statNumber}>{stats.followersGained}</Text>
                                <Text style={statLabel}>New Followers</Text>
                            </Column>
                        </Row>
                    </Section>

                    <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`} style={btn}>
                        View Full Analytics
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
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: "0 auto",
    padding: "40px 20px",
    width: "560px",
    borderRadius: '8px',
    marginTop: '40px',
};

const h1 = {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 10px",
    textAlign: "center" as const,
    color: "#333",
};

const subtitle = {
    fontSize: "14px",
    color: "#666",
    textAlign: "center" as const,
    marginBottom: "30px",
};

const statsContainer = {
    padding: '20px 0',
    borderTop: '1px solid #eee',
    borderBottom: '1px solid #eee',
};

const statBox = {
    textAlign: 'center' as const,
};

const statNumber = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#007bff',
    margin: '0',
};

const statLabel = {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0 0',
    textTransform: 'uppercase' as const,
};

const btn = {
    backgroundColor: "#007bff",
    borderRadius: "3px",
    color: "#fff",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px",
    margin: "30px 0 0",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: 'center' as const,
    marginTop: '20px',
};
