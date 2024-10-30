declare function defaults1(options: any): void;
interface DTO {
    id?: string;
    port: number;
    topics: Array<string>;
}
declare function defaults2(options: DTO): void;
