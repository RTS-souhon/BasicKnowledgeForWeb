export interface ServiceBinding {
    fetch(request: Request, init?: RequestInit): Promise<Response>;
}

export interface Env {
    BACKEND?: ServiceBinding;
}
