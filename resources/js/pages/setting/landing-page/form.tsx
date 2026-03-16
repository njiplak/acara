import { router, useForm } from '@inertiajs/react';
import { ImageIcon, LoaderCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { PhoneInput } from '@/components/phone-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { update } from '@/routes/backoffice/setting/landing-page';
import type { LandingPageSetting } from '@/types/landing-page-setting';

type Props = {
    landingPageSetting: LandingPageSetting;
    logoUrl?: string | null;
};

export default function LandingPageSettingForm({ landingPageSetting, logoUrl }: Props) {
    const [logoPreview, setLogoPreview] = useState<string | null>(logoUrl ?? null);
    const { data, setData, errors, processing, post } = useForm<Record<string, any>>({
        logo: null as File | null,
        business_name: landingPageSetting.business_name ?? '',
        business_description: landingPageSetting.business_description ?? '',
        business_phone: landingPageSetting.business_phone ?? '',
        business_email: landingPageSetting.business_email ?? '',
        business_address: landingPageSetting.business_address ?? '',
        hero_badge_text: landingPageSetting.hero_badge_text ?? '',
        hero_title: landingPageSetting.hero_title ?? '',
        hero_subtitle: landingPageSetting.hero_subtitle ?? '',
        cta_text: landingPageSetting.cta_text ?? '',
        cta_url: landingPageSetting.cta_url ?? '',
        meta_title: landingPageSetting.meta_title ?? '',
        meta_description: landingPageSetting.meta_description ?? '',
        meta_keywords: landingPageSetting.meta_keywords ?? '',
        og_image: landingPageSetting.og_image ?? '',
        google_site_verification: landingPageSetting.google_site_verification ?? '',
        google_analytics_id: landingPageSetting.google_analytics_id ?? '',
        google_tag_manager_id: landingPageSetting.google_tag_manager_id ?? '',
        meta_pixel_id: landingPageSetting.meta_pixel_id ?? '',
        custom_head_scripts: landingPageSetting.custom_head_scripts ?? '',
        social_instagram: landingPageSetting.social_instagram ?? '',
        social_whatsapp: landingPageSetting.social_whatsapp ?? '',
        social_tiktok: landingPageSetting.social_tiktok ?? '',
        social_facebook: landingPageSetting.social_facebook ?? '',
        footer_text: landingPageSetting.footer_text ?? '',
        payment_instruction: landingPageSetting.payment_instruction ?? '',
    });

    const handleLogoChange = (file: File | null) => {
        setData('logo', file);
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.post(update().url, { ...data, _method: 'PUT' }, { ...FormResponse, forceFormData: true });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Logo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-6">
                        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="size-full object-contain" />
                            ) : (
                                <ImageIcon className="size-8 text-muted-foreground/50" />
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent"
                                onChange={(e) => handleLogoChange(e.target.files?.[0] || null)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Upload your business logo (max 2MB). Displayed in the header of public pages.
                            </p>
                            <InputError message={errors?.logo} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Business Name</Label>
                        <Input
                            value={data.business_name}
                            onChange={(e) => setData('business_name', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Your business or brand name displayed on the landing page
                        </p>
                        <InputError message={errors?.business_name} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Business Description</Label>
                        <Textarea
                            rows={3}
                            value={data.business_description}
                            onChange={(e) => setData('business_description', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            A short description of your business shown in the about section
                        </p>
                        <InputError message={errors?.business_description} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Phone</Label>
                            <PhoneInput
                                defaultCountry="ID"
                                value={data.business_phone}
                                onChange={(value) => setData('business_phone', value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Contact phone number shown on the landing page
                            </p>
                            <InputError message={errors?.business_phone} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={data.business_email}
                                onChange={(e) => setData('business_email', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Contact email address shown on the landing page
                            </p>
                            <InputError message={errors?.business_email} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Address</Label>
                        <Textarea
                            rows={2}
                            value={data.business_address}
                            onChange={(e) => setData('business_address', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Physical address displayed in the contact or footer section
                        </p>
                        <InputError message={errors?.business_address} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Badge Text</Label>
                        <Input
                            value={data.hero_badge_text}
                            onChange={(e) => setData('hero_badge_text', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Small badge label above the hero title (e.g. "New", "Best Seller")
                        </p>
                        <InputError message={errors?.hero_badge_text} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Title</Label>
                        <Input
                            value={data.hero_title}
                            onChange={(e) => setData('hero_title', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Main heading displayed in the hero section
                        </p>
                        <InputError message={errors?.hero_title} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Subtitle</Label>
                        <Textarea
                            rows={3}
                            value={data.hero_subtitle}
                            onChange={(e) => setData('hero_subtitle', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Supporting text below the hero title to describe your offering
                        </p>
                        <InputError message={errors?.hero_subtitle} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>CTA Text</Label>
                            <Input
                                value={data.cta_text}
                                onChange={(e) => setData('cta_text', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Label for the call-to-action button (e.g. "Book Now", "Get Started")
                            </p>
                            <InputError message={errors?.cta_text} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>CTA URL</Label>
                            <Input
                                value={data.cta_url}
                                onChange={(e) => setData('cta_url', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Link the CTA button points to (e.g. a WhatsApp link or booking page)
                            </p>
                            <InputError message={errors?.cta_url} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>SEO & Meta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Meta Title</Label>
                        <Input
                            value={data.meta_title}
                            onChange={(e) => setData('meta_title', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Page title shown in browser tabs and search engine results
                        </p>
                        <InputError message={errors?.meta_title} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Meta Description</Label>
                        <Textarea
                            rows={3}
                            value={data.meta_description}
                            onChange={(e) => setData('meta_description', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Short summary displayed in search engine results below the title
                        </p>
                        <InputError message={errors?.meta_description} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Meta Keywords</Label>
                        <Input
                            value={data.meta_keywords}
                            onChange={(e) => setData('meta_keywords', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Comma-separated keywords for search engine optimization
                        </p>
                        <InputError message={errors?.meta_keywords} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>OG Image URL</Label>
                        <Input
                            value={data.og_image}
                            onChange={(e) => setData('og_image', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Image URL used as the preview when the page is shared on social media
                        </p>
                        <InputError message={errors?.og_image} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tracking & Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Google Site Verification</Label>
                            <Input
                                value={data.google_site_verification}
                                onChange={(e) => setData('google_site_verification', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Verification code from Google Search Console
                            </p>
                            <InputError message={errors?.google_site_verification} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Google Analytics ID</Label>
                            <Input
                                value={data.google_analytics_id}
                                onChange={(e) => setData('google_analytics_id', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                GA4 measurement ID (e.g. G-XXXXXXXXXX)
                            </p>
                            <InputError message={errors?.google_analytics_id} />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Google Tag Manager ID</Label>
                            <Input
                                value={data.google_tag_manager_id}
                                onChange={(e) => setData('google_tag_manager_id', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                GTM container ID (e.g. GTM-XXXXXXX)
                            </p>
                            <InputError message={errors?.google_tag_manager_id} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Meta Pixel ID</Label>
                            <Input
                                value={data.meta_pixel_id}
                                onChange={(e) => setData('meta_pixel_id', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Facebook/Meta Pixel ID for tracking conversions
                            </p>
                            <InputError message={errors?.meta_pixel_id} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Custom Head Scripts</Label>
                        <Textarea
                            rows={4}
                            value={data.custom_head_scripts}
                            onChange={(e) => setData('custom_head_scripts', e.target.value)}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Custom HTML/JavaScript code injected into the page head (e.g. tracking scripts, chat widgets)
                        </p>
                        <InputError message={errors?.custom_head_scripts} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Social Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Instagram</Label>
                            <Input
                                value={data.social_instagram}
                                onChange={(e) => setData('social_instagram', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Instagram profile URL or username
                            </p>
                            <InputError message={errors?.social_instagram} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>WhatsApp</Label>
                            <PhoneInput
                                defaultCountry="ID"
                                value={data.social_whatsapp}
                                onChange={(value) => setData('social_whatsapp', value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                WhatsApp number for customer contact
                            </p>
                            <InputError message={errors?.social_whatsapp} />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>TikTok</Label>
                            <Input
                                value={data.social_tiktok}
                                onChange={(e) => setData('social_tiktok', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                TikTok profile URL or username
                            </p>
                            <InputError message={errors?.social_tiktok} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Facebook</Label>
                            <Input
                                value={data.social_facebook}
                                onChange={(e) => setData('social_facebook', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Facebook page URL or username
                            </p>
                            <InputError message={errors?.social_facebook} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Payment Instruction</Label>
                        <Textarea
                            rows={5}
                            value={data.payment_instruction}
                            onChange={(e) => setData('payment_instruction', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Instructions shown to customers after placing an order (e.g. bank account details, transfer steps)
                        </p>
                        <InputError message={errors?.payment_instruction} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Footer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Footer Text</Label>
                        <Input
                            value={data.footer_text}
                            onChange={(e) => setData('footer_text', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Copyright or disclaimer text displayed at the bottom of the page
                        </p>
                        <InputError message={errors?.footer_text} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex">
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="size-4 animate-spin" />}
                    Save
                </Button>
            </div>
        </form>
    );
}

LandingPageSettingForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
